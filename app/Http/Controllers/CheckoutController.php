<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\ProductPlan;
use App\Services\Promotions\PromoCodeService;
use App\Services\CreateServicesFromOrder;
use App\Services\Payments\PayPalClient;
use App\Services\Wallet\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Cashier\Cashier;
use Throwable;

final class CheckoutController extends Controller
{
    public function index(
        Request $request,
        WalletService $wallets,
        PayPalClient $paypal,
        PromoCodeService $promotions,
    ): Response|RedirectResponse {
        $checkout = $this->checkoutData($request, $promotions);

        if ($checkout['items']->isEmpty()) {
            return to_route('cart.index')->with(
                'error',
                'Votre panier est vide.',
            );
        }

        $fingerprint = $this->checkoutFingerprint(
            $request,
            $checkout,
        );

        $paymentIntent = $this->paymentIntentForCheckout(
            $request,
            $checkout['summary']['due_today_cents'],
            $fingerprint,
        );

        $wallet = $wallets->walletFor($request->user());

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
            'wallet' => [
                'balance_cents' => $wallet->balance_cents,
                'currency' => $wallet->currency,
                'can_pay' => $wallet->balance_cents
                    >= $checkout['summary']['due_today_cents'],
            ],
            'paypalConfigured' => $paypal->configured(),
            'promo' => $checkout['promo'],
        ]);
    }

    public function applyPromo(
        Request $request,
        PromoCodeService $promotions,
        WalletService $wallets,
    ): JsonResponse {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:80'],
        ]);

        $baseCheckout = $this->checkoutData(
            $request,
            $promotions,
            false,
        );

        if ($baseCheckout['items']->isEmpty()) {
            return response()->json([
                'message' => 'Votre panier est vide.',
            ], 422);
        }

        try {
            $promo = $promotions->resolve(
                $validated['code'],
                $request->user(),
                $baseCheckout['summary']['before_discount_cents'],
            );
        } catch (ValidationException $exception) {
            throw $exception;
        }

        $request->session()->put(
            'checkout_promo_code',
            $promo->code,
        );

        $checkout = $this->checkoutData(
            $request,
            $promotions,
        );

        $fingerprint = $this->checkoutFingerprint(
            $request,
            $checkout,
        );

        $paymentIntent = $this->paymentIntentForCheckout(
            $request,
            $checkout['summary']['due_today_cents'],
            $fingerprint,
        );

        $wallet = $wallets->walletFor($request->user());

        return response()->json([
            'ok' => true,
            'message' => 'Code promo appliqué.',
            'summary' => $checkout['summary'],
            'promo' => $checkout['promo'],
            'clientSecret' => $paymentIntent->client_secret,
            'paymentIntentId' => $paymentIntent->id,
            'wallet' => [
                'balance_cents' => $wallet->balance_cents,
                'currency' => $wallet->currency,
                'can_pay' => $wallet->balance_cents
                    >= $checkout['summary']['due_today_cents'],
            ],
        ]);
    }

    public function removePromo(
        Request $request,
        PromoCodeService $promotions,
        WalletService $wallets,
    ): JsonResponse {
        $request->session()->forget('checkout_promo_code');

        $checkout = $this->checkoutData(
            $request,
            $promotions,
        );

        $fingerprint = $this->checkoutFingerprint(
            $request,
            $checkout,
        );

        $paymentIntent = $this->paymentIntentForCheckout(
            $request,
            $checkout['summary']['due_today_cents'],
            $fingerprint,
        );

        $wallet = $wallets->walletFor($request->user());

        return response()->json([
            'ok' => true,
            'message' => 'Code promo retiré.',
            'summary' => $checkout['summary'],
            'promo' => null,
            'clientSecret' => $paymentIntent->client_secret,
            'paymentIntentId' => $paymentIntent->id,
            'wallet' => [
                'balance_cents' => $wallet->balance_cents,
                'currency' => $wallet->currency,
                'can_pay' => $wallet->balance_cents
                    >= $checkout['summary']['due_today_cents'],
            ],
        ]);
    }

    public function store(
        Request $request,
        WalletService $wallets,
    ): JsonResponse {
        $action = $request->string('action', 'validate')->toString();
        $validated = $this->validateBilling($request);

        if ($action === 'validate') {
            return response()->json(['ok' => true]);
        }

        if ($action === 'wallet') {
            return $this->payWithWallet(
                $request,
                $validated,
                $wallets,
            );
        }

        abort_unless(
            $action === 'finalize',
            422,
            'Action de paiement inconnue.',
        );

        return $this->finalizeStripe($request, $validated);
    }

    public function paypalCreate(
        Request $request,
        PayPalClient $paypal,
    ): \Symfony\Component\HttpFoundation\Response {
        abort_unless(
            $paypal->configured(),
            503,
            'PayPal n’est pas configuré.',
        );

        $validated = $this->validateBilling($request);
        $checkout = $this->checkoutData($request);

        if ($checkout['items']->isEmpty()) {
            return to_route('cart.index')->with(
                'error',
                'Votre panier est vide.',
            );
        }

        $checkoutReference = (string) Str::uuid();

        $paypalOrder = $paypal->createOrder(
            $checkout['summary']['due_today_cents'],
            'checkout-'.$checkoutReference,
            route('checkout.paypal.return'),
            route('checkout.paypal.cancel'),
        );

        $request->session()->put(
            'checkout_paypal.'.$paypalOrder['id'],
            [
                'user_id' => $request->user()->id,
                'reference' => $checkoutReference,
                'amount_cents' => $checkout['summary']['due_today_cents'],
                'billing' => $validated,
                'created_at' => now()->timestamp,
            ],
        );

        return Inertia::location($paypalOrder['approval_url']);
    }

    public function paypalReturn(
        Request $request,
        PayPalClient $paypal,
    ): RedirectResponse {
        $paypalOrderId = $request->string('token')->toString();

        if ($paypalOrderId === '') {
            return to_route('checkout.index')->with(
                'error',
                'Référence PayPal absente.',
            );
        }

        $sessionKey = 'checkout_paypal.'.$paypalOrderId;
        $pending = $request->session()->get($sessionKey);

        if (
            ! is_array($pending)
            || (int) ($pending['user_id'] ?? 0)
                !== (int) $request->user()->id
        ) {
            return to_route('checkout.index')->with(
                'error',
                'Cette transaction PayPal ne correspond pas à votre compte.',
            );
        }

        $existingOrder = Order::query()
            ->where('user_id', $request->user()->id)
            ->where('payment_provider', 'paypal')
            ->where(function ($query) use ($paypalOrderId): void {
                $query->where(
                    'payment_reference',
                    $paypalOrderId,
                )->orWhere(
                    'metadata->paypal_order_id',
                    $paypalOrderId,
                );
            })
            ->first();

        if ($existingOrder !== null) {
            $this->clearCheckoutSession($request);
            $request->session()->forget($sessionKey);

            return to_route('client.services.index')->with(
                'success',
                'Paiement PayPal déjà confirmé.',
            );
        }

        try {
            $capture = $paypal->captureOrder($paypalOrderId);
        } catch (Throwable $exception) {
            report($exception);

            return to_route('checkout.index')->with(
                'error',
                'PayPal n’a pas pu confirmer le paiement.',
            );
        }

        $captureData = data_get(
            $capture,
            'purchase_units.0.payments.captures.0',
        );

        $captureStatus = data_get($captureData, 'status');
        $captureId = data_get($captureData, 'id');
        $currency = data_get(
            $captureData,
            'amount.currency_code',
        );
        $amount = data_get($captureData, 'amount.value');
        $capturedCents = (int) round(((float) $amount) * 100);

        if (
            $captureStatus !== 'COMPLETED'
            || ! is_string($captureId)
            || $currency !== 'EUR'
            || $capturedCents !== (int) $pending['amount_cents']
        ) {
            return to_route('checkout.index')->with(
                'error',
                'La capture PayPal ne correspond pas à la commande.',
            );
        }

        $checkout = $this->checkoutData($request);

        if (
            $checkout['items']->isEmpty()
            || $checkout['summary']['due_today_cents']
                !== (int) $pending['amount_cents']
        ) {
            return to_route('checkout.index')->with(
                'error',
                'Le panier a changé depuis l’ouverture de PayPal.',
            );
        }

        $order = $this->createPaidOrder(
            $request,
            $pending['billing'],
            $checkout,
            'paypal',
            $captureId,
            [
                'source' => 'paypal_orders_v2',
                'paypal_order_id' => $paypalOrderId,
                'paypal_capture_id' => $captureId,
                'checkout_reference' => $pending['reference'],
            ],
        );

        $this->provision($request, $order);
        $this->clearCheckoutSession($request);
        $request->session()->forget($sessionKey);

        return to_route('client.services.index')->with(
            'success',
            'Paiement PayPal accepté. Votre commande a été validée.',
        );
    }

    public function paypalCancel(
        Request $request,
    ): RedirectResponse {
        $paypalOrderId = $request->string('token')->toString();

        if ($paypalOrderId !== '') {
            $request->session()->forget(
                'checkout_paypal.'.$paypalOrderId,
            );
        }

        return to_route('checkout.index')->with(
            'error',
            'Le paiement PayPal a été annulé.',
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

        return Inertia::render(
            'store/checkout-success',
            ['order' => $order],
        );
    }

    private function finalizeStripe(
        Request $request,
        array $validated,
    ): JsonResponse {
        $paymentIntentId = $request->validate([
            'payment_intent_id' => [
                'required',
                'string',
                'max:255',
            ],
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

        if ($existingOrder !== null) {
            return response()->json([
                'ok' => true,
                'redirect' => '/client/services',
            ]);
        }

        $paymentIntent = Cashier::stripe()
            ->paymentIntents
            ->retrieve($paymentIntentId);

        if (
            ($paymentIntent->metadata->user_id ?? null)
                !== (string) $request->user()->id
        ) {
            return response()->json([
                'message' => 'Ce paiement ne correspond pas à votre compte.',
            ], 403);
        }

        if ($paymentIntent->status !== 'succeeded') {
            return response()->json([
                'message' => 'Le paiement n’a pas été accepté.',
            ], 422);
        }

        if (
            (int) $paymentIntent->amount_received
                !== (int) $checkout['summary']['due_today_cents']
        ) {
            return response()->json([
                'message' => 'Le montant ne correspond plus au panier.',
            ], 422);
        }

        $order = $this->createPaidOrder(
            $request,
            $validated,
            $checkout,
            'stripe',
            $paymentIntent->id,
            [
                'source' => 'stripe_payment_element',
                'stripe_payment_intent' => $paymentIntent->id,
            ],
        );

        $this->provision($request, $order);
        $this->clearCheckoutSession($request);

        return response()->json([
            'ok' => true,
            'redirect' => '/client/services',
        ]);
    }

    private function payWithWallet(
        Request $request,
        array $validated,
        WalletService $wallets,
    ): JsonResponse {
        $checkout = $this->checkoutData($request);

        if ($checkout['items']->isEmpty()) {
            return response()->json([
                'message' => 'Votre panier est vide.',
            ], 422);
        }

        $reference = $request->validate([
            'wallet_reference' => [
                'required',
                'uuid',
            ],
        ])['wallet_reference'];

        $existingOrder = Order::query()
            ->where('user_id', $request->user()->id)
            ->where('payment_provider', 'wallet')
            ->where('payment_reference', $reference)
            ->first();

        if ($existingOrder !== null) {
            return response()->json([
                'ok' => true,
                'redirect' => '/client/services',
            ]);
        }

        $order = DB::transaction(function () use (
            $request,
            $validated,
            $checkout,
            $wallets,
            $reference,
        ): Order {
            $wallets->debit(
                $request->user(),
                $checkout['summary']['due_today_cents'],
                'order_payment',
                'wallet',
                'wallet-order:'.$reference,
                'Paiement d’une commande Astreon',
                null,
                [
                    'checkout_reference' => $reference,
                ],
            );

            return $this->createPaidOrder(
                $request,
                $validated,
                $checkout,
                'wallet',
                $reference,
                [
                    'source' => 'astreon_wallet',
                    'checkout_reference' => $reference,
                ],
                false,
            );
        }, 3);

        $this->provision($request, $order);
        $this->clearCheckoutSession($request);

        return response()->json([
            'ok' => true,
            'redirect' => '/client/services',
        ]);
    }

    private function createPaidOrder(
        Request $request,
        array $billing,
        array $checkout,
        string $provider,
        string $paymentReference,
        array $metadata,
        bool $transaction = true,
    ): Order {
        $callback = function () use (
            $request,
            $billing,
            $checkout,
            $provider,
            $paymentReference,
            $metadata,
        ): Order {
            $order = Order::query()->create([
                'user_id' => $request->user()->id,
                'reference' => $this->generateReference(),
                'status' => 'paid',
                'currency' => 'EUR',
                'subtotal_cents' => $checkout['summary']['monthly_cents'],
                'setup_total_cents' => $checkout['summary']['setup_cents'],
                'tax_total_cents' => 0,
                'discount_cents' =>
                    $checkout['summary']['discount_cents'],
                'promo_code_id' =>
                    $checkout['promo']['id'] ?? null,
                'promo_code' =>
                    $checkout['promo']['code'] ?? null,
                'total_cents' => $checkout['summary']['due_today_cents'],
                'billing_name' => $billing['billing_name'],
                'billing_email' => $billing['billing_email'],
                'billing_company' => $billing['billing_company'] ?? null,
                'billing_address' => $billing['billing_address'],
                'billing_postal_code' => $billing['billing_postal_code'],
                'billing_city' => $billing['billing_city'],
                'billing_country' => strtoupper(
                    $billing['billing_country'],
                ),
                'terms_accepted' => true,
                'terms_accepted_at' => now(),
                'payment_provider' => $provider,
                'payment_reference' => $paymentReference,
                'paid_at' => now(),
                'metadata' => array_merge($metadata, [
                    'ip' => $request->ip(),
                    'promo' => $checkout['promo'],
                ]),
            ]);

            foreach ($checkout['items'] as $item) {
                $order->items()->create([
                    'product_plan_id' => $item['plan_id'],
                    'product_name' => isset(
                        $item['options']['ark_edition'],
                    )
                        ? $item['product']['name'].' — '.(
                            $item['options']['ark_edition']
                                === 'survival-ascended'
                                    ? 'Survival Ascended'
                                    : 'Survival Evolved'
                        )
                        : $item['product']['name'],
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

            if ($checkout['promo'] !== null) {
                app(PromoCodeService::class)->recordUsage(
                    (int) $checkout['promo']['id'],
                    $request->user(),
                    $order,
                    (int) $checkout['summary']['discount_cents'],
                );
            }

            activity()
                ->causedBy($request->user())
                ->performedOn($order)
                ->event('order_paid')
                ->withProperties([
                    'reference' => $order->reference,
                    'total_cents' => $order->total_cents,
                    'provider' => $provider,
                    'payment_reference' => $paymentReference,
                ])
                ->log(
                    "Paiement confirmé et commande créée : {$order->reference}",
                );

            return $order;
        };

        return $transaction
            ? DB::transaction($callback, 3)
            : $callback();
    }

    private function provision(
    Request $request,
    Order $order,
): void {
    /*
     * Recharge la commande et ses articles depuis la base.
     * Cela évite d'utiliser une instance créée dans la transaction
     * dont les relations ne sont pas encore chargées.
     */
    $order = Order::query()
        ->with([
            'items',
            'items.productPlan',
        ])
        ->findOrFail($order->id);

    try {
        app(CreateServicesFromOrder::class)->handle($order);

        activity()
            ->causedBy($request->user())
            ->performedOn($order)
            ->event('service_provisioning_completed')
            ->withProperties([
                'reference' => $order->reference,
            ])
            ->log(
                "Services automatiquement déployés pour {$order->reference}",
            );
    } catch (Throwable $exception) {
        report($exception);

        activity()
            ->causedBy($request->user())
            ->performedOn($order)
            ->event('service_provisioning_failed')
            ->withProperties([
                'message' => $exception->getMessage(),
                'exception' => $exception::class,
            ])
            ->log(
                "Paiement accepté, mais déploiement échoué pour {$order->reference}",
            );

        /*
         * Deuxième tentative immédiate.
         * Utile pour une allocation momentanément verrouillée
         * ou une requête réseau temporairement indisponible.
         */
        try {
            usleep(500000);

            $order->refresh();
            $order->loadMissing([
                'items',
                'items.productPlan',
            ]);

            app(CreateServicesFromOrder::class)->handle($order);
        } catch (Throwable $retryException) {
            report($retryException);

            activity()
                ->causedBy($request->user())
                ->performedOn($order)
                ->event('service_provisioning_retry_failed')
                ->withProperties([
                    'message' => $retryException->getMessage(),
                    'exception' => $retryException::class,
                ])
                ->log(
                    "Seconde tentative de déploiement échouée pour {$order->reference}",
                );
        }
    }
}

    private function checkoutFingerprint(
        Request $request,
        array $checkout,
    ): string {
        return hash(
            'sha256',
            json_encode([
                'user' => $request->user()->id,
                'amount' => $checkout['summary']['due_today_cents'],
                'promo' => $checkout['promo']['code'] ?? null,
                'items' => $checkout['items']
                    ->map(fn (array $item): array => [
                        $item['plan_id'],
                        $item['quantity'],
                        $item['line_monthly_cents'],
                        $item['line_setup_cents'],
                        $item['options'] ?? [],
                    ])
                    ->all(),
            ], JSON_THROW_ON_ERROR),
        );
    }

    private function paymentIntentForCheckout(
        Request $request,
        int $amount,
        string $fingerprint,
    ): object {
        $intentId = $request->session()->get(
            'checkout_payment_intent_id',
        );

        $storedFingerprint = $request->session()->get(
            'checkout_payment_fingerprint',
        );

        if (
            is_string($intentId)
            && $storedFingerprint === $fingerprint
        ) {
            try {
                $existing = Cashier::stripe()
                    ->paymentIntents
                    ->retrieve($intentId);

                if (
                    in_array(
                        $existing->status,
                        [
                            'requires_payment_method',
                            'requires_confirmation',
                            'requires_action',
                        ],
                        true,
                    )
                ) {
                    return $existing;
                }
            } catch (Throwable) {
                // Un nouvel intent est créé ci-dessous.
            }
        }

        $intent = Cashier::stripe()->paymentIntents->create([
            'amount' => $amount,
            'currency' => 'eur',
            'automatic_payment_methods' => ['enabled' => true],
            'receipt_email' => $request->user()->email,
            'description' => 'Commande Astreon',
            'metadata' => [
                'user_id' => (string) $request->user()->id,
                'cart_fingerprint' => $fingerprint,
            ],
        ]);

        $request->session()->put(
            'checkout_payment_intent_id',
            $intent->id,
        );

        $request->session()->put(
            'checkout_payment_fingerprint',
            $fingerprint,
        );

        return $intent;
    }

    private function validateBilling(Request $request): array
    {
        return $request->validate([
            'billing_name' => [
                'required',
                'string',
                'max:150',
            ],
            'billing_email' => [
                'required',
                'email',
                'max:190',
            ],
            'billing_company' => [
                'nullable',
                'string',
                'max:190',
            ],
            'billing_address' => [
                'required',
                'string',
                'max:255',
            ],
            'billing_postal_code' => [
                'required',
                'string',
                'max:20',
            ],
            'billing_city' => [
                'required',
                'string',
                'max:120',
            ],
            'billing_country' => [
                'required',
                'string',
                'size:2',
            ],
            'terms_accepted' => ['accepted'],
        ]);
    }

    private function checkoutData(
        Request $request,
        ?PromoCodeService $promotions = null,
        bool $applySessionPromo = true,
    ): array
    {
        $cart = $request->session()->get('cart', []);

        if (! is_array($cart)) {
            $cart = [];
        }

        $cartOptions = $request->session()->get(
            'cart_options',
            [],
        );

        if (! is_array($cartOptions)) {
            $cartOptions = [];
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
            ) use ($plans, $cartOptions): ?array {
                $plan = $plans->get((int) $planId);

                if (! $plan || ! $plan->isAvailable()) {
                    return null;
                }

                $options = $cartOptions[(int) $planId] ?? [];

                $provisioningConfig = is_array(
                    $plan->provisioning_config,
                )
                    ? $plan->provisioning_config
                    : [];

                if (isset($options['ark_egg_id'])) {
                    $provisioningConfig = array_replace_recursive(
                        $provisioningConfig,
                        [
                            'nest_id' => 5,
                            'egg_id' => (int) $options['ark_egg_id'],
                            'selected_game' => $options['ark_edition'],
                        ],
                    );
                }

                return [
                    'plan_id' => $plan->id,
                    'quantity' => $quantity,
                    'name' => $plan->name,
                    'sku' => $plan->sku,
                    'price_monthly_cents' => $plan->price_monthly_cents,
                    'setup_fee_cents' => $plan->setup_fee_cents,
                    'line_monthly_cents' =>
                        $plan->price_monthly_cents * $quantity,
                    'line_setup_cents' =>
                        $plan->setup_fee_cents * $quantity,
                    'product' => [
                        'name' => $plan->product?->name,
                        'slug' => $plan->product?->slug,
                    ],
                    'category' => [
                        'name' => $plan->product?->category?->name,
                    ],
                    'options' => $options,
                    'snapshot' => [
                        'features' => $plan->features,
                        'specifications' => $plan->specifications,
                        'provisioning_config' => $provisioningConfig,
                        'billing_cycles' => $plan->billing_cycles,
                        'customer_options' => $options,
                    ],
                ];
            })
            ->filter()
            ->values();

        $monthlyCents = (int) $items->sum(
            'line_monthly_cents',
        );

        $setupCents = (int) $items->sum(
            'line_setup_cents',
        );

        $beforeDiscountCents =
            $monthlyCents + $setupCents;

        $promoPayload = null;
        $discountCents = 0;

        if ($applySessionPromo) {
            $promotions ??= app(PromoCodeService::class);

            $sessionCode = $request->session()->get(
                'checkout_promo_code',
            );

            if (is_string($sessionCode) && $sessionCode !== '') {
                try {
                    $promo = $promotions->resolve(
                        $sessionCode,
                        $request->user(),
                        $beforeDiscountCents,
                    );

                    $discountCents = $promotions->discountCents(
                        $promo,
                        $beforeDiscountCents,
                    );

                    $promoPayload = [
                        'id' => $promo->id,
                        'code' => $promo->code,
                        'label' => $promo->label,
                        'type' => $promo->type,
                        'value' => $promo->value,
                        'discount_cents' => $discountCents,
                    ];
                } catch (ValidationException) {
                    $request->session()->forget(
                        'checkout_promo_code',
                    );
                }
            }
        }

        return [
            'items' => $items,
            'promo' => $promoPayload,
            'summary' => [
                'quantity' => $items->sum('quantity'),
                'monthly_cents' => $monthlyCents,
                'setup_cents' => $setupCents,
                'before_discount_cents' =>
                    $beforeDiscountCents,
                'discount_cents' => $discountCents,
                'due_today_cents' => max(
                    0,
                    $beforeDiscountCents - $discountCents,
                ),
            ],
        ];
    }

    private function clearCheckoutSession(
        Request $request,
    ): void {
        $request->session()->forget([
            'cart',
            'cart_options',
            'checkout_payment_intent_id',
            'checkout_payment_fingerprint',
            'checkout_promo_code',
        ]);
    }

    private function generateReference(): string
    {
        do {
            $reference = 'AST-'
                .now()->format('Ymd')
                .'-'
                .Str::upper(Str::random(8));
        } while (
            Order::query()
                ->where('reference', $reference)
                ->exists()
        );

        return $reference;
    }
}
