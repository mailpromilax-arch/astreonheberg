<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\ProductPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $checkout = $this->checkoutData($request);

        if ($checkout['items']->isEmpty()) {
            return to_route('cart.index')
                ->with('error', 'Votre panier est vide.');
        }

        return Inertia::render('store/checkout', [
            'items' => $checkout['items'],
            'summary' => $checkout['summary'],
            'customer' => [
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'company' => $request->user()->company_name,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'billing_name' => ['required', 'string', 'max:150'],
            'billing_email' => ['required', 'email', 'max:190'],
            'billing_company' => ['nullable', 'string', 'max:190'],
            'billing_address' => ['required', 'string', 'max:255'],
            'billing_postal_code' => ['required', 'string', 'max:20'],
            'billing_city' => ['required', 'string', 'max:120'],
            'billing_country' => ['required', 'string', 'size:2'],
            'terms_accepted' => ['accepted'],
        ]);

        $checkout = $this->checkoutData($request);

        if ($checkout['items']->isEmpty()) {
            return to_route('cart.index')
                ->with('error', 'Votre panier est vide.');
        }

        $order = DB::transaction(function () use (
            $request,
            $validated,
            $checkout,
        ): Order {
            $order = Order::create([
                'user_id' => $request->user()->id,
                'reference' => $this->generateReference(),
                'status' => 'pending_payment',
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
                'billing_country' => strtoupper(
                    $validated['billing_country'],
                ),
                'terms_accepted' => true,
                'terms_accepted_at' => now(),
                'metadata' => [
                    'source' => 'web_checkout',
                    'ip' => $request->ip(),
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
                    'line_total_cents' => $item['line_monthly_cents']
                        + $item['line_setup_cents'],
                    'plan_snapshot' => $item['snapshot'],
                ]);
            }

            activity()
                ->causedBy($request->user())
                ->performedOn($order)
                ->event('order_created')
                ->withProperties([
                    'reference' => $order->reference,
                    'total_cents' => $order->total_cents,
                ])
                ->log("Création de la commande {$order->reference}");

            return $order;
        });

        $request->session()->forget('cart');

        return to_route('checkout.success', $order)
            ->with(
                'success',
                'Votre commande a été créée et attend son paiement.',
            );
    }

    public function success(
        Request $request,
        Order $order,
    ): Response {
        abort_unless(
            $order->user_id === $request->user()->id,
            403,
        );

        $order->load('items');

        return Inertia::render('store/checkout-success', [
            'order' => $order,
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
            ->map(function (
                int $quantity,
                int|string $planId,
            ) use ($plans): ?array {
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
                    'line_monthly_cents' => $plan->price_monthly_cents
                        * $quantity,
                    'line_setup_cents' => $plan->setup_fee_cents
                        * $quantity,
                    'product' => [
                        'name' => $plan->product?->name,
                        'slug' => $plan->product?->slug,
                    ],
                    'category' => [
                        'name' => $plan->product?->category?->name,
                    ],
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
                'due_today_cents' => $items->sum('line_monthly_cents')
                    + $items->sum('line_setup_cents'),
            ],
        ];
    }

    private function generateReference(): string
    {
        do {
            $reference = 'AST-'
                .now()->format('Ymd')
                .'-'
                .Str::upper(Str::random(8));
        } while (
            Order::where('reference', $reference)->exists()
        );

        return $reference;
    }
}