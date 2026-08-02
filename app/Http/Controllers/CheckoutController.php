<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\ProductPlan;
use App\Services\CreateServicesFromOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Cashier\Cashier;
use Throwable;

class CheckoutController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $checkout = $this->checkoutData($request);

        if ($checkout['items']->isEmpty()) {
            return to_route('cart.index')->with('error', 'Votre panier est vide.');
        }

        $fingerprint = hash('sha256', json_encode([
            'user' => $request->user()->id,
            'amount' => $checkout['summary']['due_today_cents'],
            'items' => $checkout['items']->map(fn (array $item) => [
                $item['plan_id'],
                $item['quantity'],
                $item['line_monthly_cents'],
                $item['line_setup_cents'],
            ])->all(),
        ], JSON_THROW_ON_ERROR));

        $paymentIntent = $this->paymentIntentForCheckout(
            $request,
            $checkout['summary']['due_today_cents'],
            $fingerprint,
        );

        return Inertia::render('store/checkout', [
            'items' => $checkout['items'],
            'summary' => $checkout['summary'],
            'customer' => [
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'company' => $request->user()->company_name,
            ],
            'stripeKey' => config('cashier.key') ?: env('STRIPE_KEY'),
            'clientSecret' => $paymentIntent->client_secret,
            'paymentIntentId' => $paymentIntent->id,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $action = $request->string('action', 'validate')->toString();
        $validated = $this->validateBilling($request);

        if ($action === 'validate') {
            return response()->json(['ok' => true]);
        }

        abort_unless($action === 'finalize', 422, 'Action de paiement inconnue.');

        $paymentIntentId = $request->validate([
            'payment_intent_id' => ['required', 'string', 'max:255'],
        ])['payment_intent_id'];

        $checkout = $this->checkoutData($request);

        if ($checkout['items']->isEmpty()) {
            return response()->json([
                'message' => 'Votre panier est vide.',
            ], 422);
        }

        $existingOrder = Order::query()
            ->where('user_id', $request->user()->id)
            ->where('payment_provider', 'stripe')
            ->where('payment_reference', $paymentIntentId)
            ->first();

        if ($existingOrder) {
            $request->session()->flash('success', 'Paiement accepté. Votre service est disponible.');

            return response()->json([
                'ok' => true,
                'redirect' => '/client/services',
            ]);
        }

        $paymentIntent = Cashier::stripe()->paymentIntents->retrieve($paymentIntentId);

        if (($paymentIntent->metadata->user_id ?? null) !== (string) $request->user()->id) {
            return response()->json(['message' => 'Ce paiement ne correspond pas à votre compte.'], 403);
        }

        if ($paymentIntent->status !== 'succeeded') {
            return response()->json([
                'message' => 'Le paiement n’a pas été accepté. Vérifiez votre carte puis réessayez.',
            ], 422);
        }

        if ((int) $paymentIntent->amount_received !== (int) $checkout['summary']['due_today_cents']) {
            return response()->json(['message' => 'Le montant du paiement ne correspond plus au panier.'], 422);
        }

        $order = DB::transaction(function () use ($request, $validated, $checkout, $paymentIntent): Order {
            $order = Order::create([
                'user_id' => $request->user()->id,
                'reference' => $this->generateReference(),
                'status' => 'paid',
                'currency' => 'EUR',
                'subtotal_cents' => $checkout['summary']['monthly_cents'],
                'setup_total_cents' => $checkout['summary']['setup_cents'],
                'tax_total_cents' => 0,
                'total_cents' => $checkout['summary']['due_today_cents'],
                'billing_name' => $validated['billing_name'],
                'billing_email' => $validated['billing_email'],
                'billing_company' => $validated['billing_company'] ?? null,
                'billing_address' => $validated['billing_address'],
                'billing_postal_code' => $validated['billing_postal_code'],
                'billing_city' => $validated['billing_city'],
                'billing_country' => strtoupper($validated['billing_country']),
                'terms_accepted' => true,
                'terms_accepted_at' => now(),
                'payment_provider' => 'stripe',
                'payment_reference' => $paymentIntent->id,
                'paid_at' => now(),
                'metadata' => [
                    'source' => 'stripe_payment_element',
                    'ip' => $request->ip(),
                    'stripe_payment_intent' => $paymentIntent->id,
                ],
            ]);

            foreach ($checkout['items'] as $item) {
                $order->items()->create([
                    'product_plan_id' => $item['plan_id'],
                    'product_name' => $item['product']['name'],
                    'plan_name' => $item['name'],
                    'sku' => $item['sku'],
                    'quantity' => $item['quantity'],
                    'billing_cycle' => 'monthly',
                    'unit_price_cents' => $item['price_monthly_cents'],
                    'setup_fee_cents' => $item['setup_fee_cents'],
                    'line_subtotal_cents' => $item['line_monthly_cents'],
                    'line_setup_cents' => $item['line_setup_cents'],
                    'line_total_cents' => $item['line_monthly_cents'] + $item['line_setup_cents'],
                    'plan_snapshot' => $item['snapshot'],
                ]);
            }

            activity()
                ->causedBy($request->user())
                ->performedOn($order)
                ->event('order_paid')
                ->withProperties([
                    'reference' => $order->reference,
                    'total_cents' => $order->total_cents,
                    'provider' => 'stripe',
                    'payment_intent' => $paymentIntent->id,
                ])
                ->log("Paiement confirmé et commande créée : {$order->reference}");

            return $order;
        });

        try {
            app(CreateServicesFromOrder::class)->handle($order);
        } catch (Throwable $exception) {
            report($exception);

            activity()
                ->causedBy($request->user())
                ->performedOn($order)
                ->event('service_provisioning_failed')
                ->withProperties(['message' => $exception->getMessage()])
                ->log("Paiement accepté, mais déploiement à reprendre pour {$order->reference}");
        }

        $request->session()->forget([
            'cart',
            'checkout_payment_intent_id',
            'checkout_payment_fingerprint',
        ]);
        $request->session()->flash('success', 'Paiement accepté. Votre commande a bien été validée.');

        return response()->json([
            'ok' => true,
            'redirect' => '/client/services',
        ]);
    }

    public function success(Request $request, Order $order): Response
    {
        abort_unless($order->user_id === $request->user()->id, 403);
        $order->load('items');

        return Inertia::render('store/checkout-success', ['order' => $order]);
    }

    private function paymentIntentForCheckout(Request $request, int $amount, string $fingerprint): object
    {
        $intentId = $request->session()->get('checkout_payment_intent_id');
        $storedFingerprint = $request->session()->get('checkout_payment_fingerprint');

        if (is_string($intentId) && $storedFingerprint === $fingerprint) {
            try {
                $existing = Cashier::stripe()->paymentIntents->retrieve($intentId);

                if (in_array($existing->status, ['requires_payment_method', 'requires_confirmation', 'requires_action'], true)) {
                    return $existing;
                }
            } catch (Throwable) {
                // Un nouvel intent sera créé ci-dessous.
            }
        }

        $intent = Cashier::stripe()->paymentIntents->create([
            'amount' => $amount,
            'currency' => 'eur',
            'automatic_payment_methods' => ['enabled' => true],
            'receipt_email' => $request->user()->email,
            'description' => 'Commande AstreonHeberg',
            'metadata' => [
                'user_id' => (string) $request->user()->id,
                'cart_fingerprint' => $fingerprint,
            ],
        ]);

        $request->session()->put('checkout_payment_intent_id', $intent->id);
        $request->session()->put('checkout_payment_fingerprint', $fingerprint);

        return $intent;
    }

    private function validateBilling(Request $request): array
    {
        return $request->validate([
            'billing_name' => ['required', 'string', 'max:150'],
            'billing_email' => ['required', 'email', 'max:190'],
            'billing_company' => ['nullable', 'string', 'max:190'],
            'billing_address' => ['required', 'string', 'max:255'],
            'billing_postal_code' => ['required', 'string', 'max:20'],
            'billing_city' => ['required', 'string', 'max:120'],
            'billing_country' => ['required', 'string', 'size:2'],
            'terms_accepted' => ['accepted'],
        ]);
    }

    private function checkoutData(Request $request): array
    {
        $cart = $request->session()->get('cart', []);
        if (! is_array($cart)) {
            $cart = [];
        }

        $plans = ProductPlan::query()
            ->with([
                'product:id,product_category_id,name,slug',
                'product.category:id,name,slug',
            ])
            ->whereIn('id', array_keys($cart))
            ->get()
            ->keyBy('id');

        $items = collect($cart)
            ->map(function (int $quantity, int|string $planId) use ($plans): ?array {
                $plan = $plans->get((int) $planId);
                if (! $plan || ! $plan->isAvailable()) {
                    return null;
                }

                return [
                    'plan_id' => $plan->id,
                    'quantity' => $quantity,
                    'name' => $plan->name,
                    'sku' => $plan->sku,
                    'price_monthly_cents' => $plan->price_monthly_cents,
                    'setup_fee_cents' => $plan->setup_fee_cents,
                    'line_monthly_cents' => $plan->price_monthly_cents * $quantity,
                    'line_setup_cents' => $plan->setup_fee_cents * $quantity,
                    'product' => [
                        'name' => $plan->product?->name,
                        'slug' => $plan->product?->slug,
                    ],
                    'category' => ['name' => $plan->product?->category?->name],
                    'snapshot' => [
                        'features' => $plan->features,
                        'specifications' => $plan->specifications,
                        'provisioning_config' => $plan->provisioning_config,
                        'billing_cycles' => $plan->billing_cycles,
                    ],
                ];
            })
            ->filter()
            ->values();

        return [
            'items' => $items,
            'summary' => [
                'quantity' => $items->sum('quantity'),
                'monthly_cents' => $items->sum('line_monthly_cents'),
                'setup_cents' => $items->sum('line_setup_cents'),
                'due_today_cents' => $items->sum('line_monthly_cents') + $items->sum('line_setup_cents'),
            ],
        ];
    }

    private function generateReference(): string
    {
        do {
            $reference = 'AST-'.now()->format('Ymd').'-'.Str::upper(Str::random(8));
        } while (Order::where('reference', $reference)->exists());

        return $reference;
    }
}
