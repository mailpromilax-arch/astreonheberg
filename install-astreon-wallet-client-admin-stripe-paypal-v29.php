<?php

declare(strict_types=1);

$root = __DIR__;
$stamp = date('Ymd-His');

$files = [
    'app/Http/Controllers/Admin/UserWalletController.php',
    'app/Http/Controllers/Client/WalletController.php',
    'app/Models/Wallet.php',
    'app/Models/WalletTopUp.php',
    'app/Models/WalletTransaction.php',
    'app/Services/Payments/PayPalClient.php',
    'app/Services/Wallet/WalletService.php',
    'database/migrations/2026_08_03_100000_create_wallet_tables.php',
    'resources/js/pages/client/wallet/index.tsx',
];

foreach ($files as $relative) {
    $source = __DIR__.'/'.$relative;
    $target = $root.'/'.$relative;

    if (! is_file($source)) {
        fwrite(STDERR, "Source introuvable : {$relative}\n");
        exit(1);
    }

    if (is_file($target)) {
        copy($target, $target.'.backup-'.$stamp);
    }

    if (! is_dir(dirname($target))) {
        mkdir(dirname($target), 0775, true);
    }

    copy($source, $target);
    echo "Installé : {$relative}\n";
}

function patchFile(
    string $path,
    callable $callback,
    string $stamp,
): void {
    if (! is_file($path)) {
        fwrite(STDERR, "Fichier à modifier introuvable : {$path}\n");
        exit(1);
    }

    $content = file_get_contents($path);
    copy($path, $path.'.backup-'.$stamp);
    $updated = $callback($content);

    if (! is_string($updated)) {
        fwrite(STDERR, "Échec de modification : {$path}\n");
        exit(1);
    }

    file_put_contents($path, $updated);
    echo "Modifié : {$path}\n";
}

/*
 * User.php : relations portefeuille.
 */
patchFile(
    $root.'/app/Models/User.php',
    function (string $content): string {
        if (! str_contains(
            $content,
            'Illuminate\Database\Eloquent\Relations\HasOne',
        )) {
            $content = str_replace(
                'use Illuminate\Database\Eloquent\Relations\HasMany;',
                "use Illuminate\Database\Eloquent\Relations\HasMany;\n"
                .'use Illuminate\Database\Eloquent\Relations\HasOne;',
                $content,
            );
        }

        if (! str_contains($content, 'function wallet(): HasOne')) {
            $needle = '    public function orders(): HasMany';

            $method = <<<'PHP'
    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    public function walletTransactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

PHP;

            $content = str_replace($needle, $method.$needle, $content);
        }

        return $content;
    },
    $stamp,
);

/*
 * services.php : configuration PayPal.
 */
patchFile(
    $root.'/config/services.php',
    function (string $content): string {
        if (str_contains($content, "'paypal' => [")) {
            return $content;
        }

        $block = <<<'PHP'

    'paypal' => [
        'mode' => env('PAYPAL_MODE', 'sandbox'),
        'client_id' => env('PAYPAL_CLIENT_ID'),
        'client_secret' => env('PAYPAL_CLIENT_SECRET'),
    ],

PHP;

        $position = strrpos($content, '];');

        return substr($content, 0, $position)
            .$block
            .substr($content, $position);
    },
    $stamp,
);

/*
 * Routes.
 */
patchFile(
    $root.'/routes/web.php',
    function (string $content): string {
        $imports = [
            'use App\Http\Controllers\Client\WalletController;',
            'use App\Http\Controllers\Admin\UserWalletController;',
        ];

        foreach ($imports as $import) {
            if (! str_contains($content, $import)) {
                $content = preg_replace(
                    '/(use Illuminate\\\\Support\\\\Facades\\\\Route;\R)/',
                    "$1{$import}\n",
                    $content,
                    1,
                );
            }
        }

        if (! str_contains($content, "name('client.wallet.index')")) {
            $routes = <<<'PHP'

Route::middleware(['auth', 'verified'])
    ->prefix('client/wallet')
    ->name('client.wallet.')
    ->group(function (): void {
        Route::get('/', [WalletController::class, 'index'])
            ->name('index');

        Route::post('/stripe/intent', [WalletController::class, 'stripeIntent'])
            ->name('stripe.intent');

        Route::post('/stripe/confirm', [WalletController::class, 'stripeConfirm'])
            ->name('stripe.confirm');

        Route::post('/paypal', [WalletController::class, 'paypalCreate'])
            ->name('paypal.create');

        Route::get('/paypal/{topup}/return', [WalletController::class, 'paypalReturn'])
            ->whereNumber('topup')
            ->name('paypal.return');

        Route::get('/paypal/{topup}/cancel', [WalletController::class, 'paypalCancel'])
            ->whereNumber('topup')
            ->name('paypal.cancel');
    });

Route::middleware(['auth', 'verified', 'admin'])
    ->post(
        '/admin/users/{user}/wallet/adjust',
        [UserWalletController::class, 'adjust'],
    )
    ->whereNumber('user')
    ->name('admin.users.wallet.adjust');

PHP;

            $content .= $routes;
        }

        return $content;
    },
    $stamp,
);

/*
 * Client layout : lien portefeuille visible uniquement dans l'espace connecté.
 */
patchFile(
    $root.'/resources/js/layouts/client-layout.tsx',
    function (string $content): string {
        if (! str_contains($content, 'WalletCards')) {
            $content = str_replace(
                '    Users,',
                "    Users,\n    WalletCards,",
                $content,
            );
        }

        if (! str_contains($content, "['Portefeuille', '/client/wallet'")) {
            $content = str_replace(
                "    ['Mes commandes', '/client/orders', FileText],",
                "    ['Mes commandes', '/client/orders', FileText],\n"
                ."    ['Portefeuille', '/client/wallet', WalletCards],",
                $content,
            );
        }

        if (! str_contains($content, "['Mon portefeuille', '/client/wallet'")) {
            $content = str_replace(
                "    ['Modes de paiement', '/client/account/payment-methods', CreditCard],",
                "    ['Modes de paiement', '/client/account/payment-methods', CreditCard],\n"
                ."    ['Mon portefeuille', '/client/wallet', WalletCards],",
                $content,
            );
        }

        return $content;
    },
    $stamp,
);

/*
 * Menu latéral du compte.
 */
patchFile(
    $root.'/resources/js/pages/client/account/components/account-layout.tsx',
    function (string $content): string {
        if (! str_contains($content, 'WalletCards')) {
            $content = str_replace(
                '    Users,',
                "    Users,\n    WalletCards,",
                $content,
            );
        }

        if (! str_contains($content, "href: '/client/wallet'")) {
            $content = str_replace(
                "{ label: 'Modes de paiement', href: '/client/account/payment-methods', icon: CreditCard },",
                "{ label: 'Modes de paiement', href: '/client/account/payment-methods', icon: CreditCard },\n"
                ."    { label: 'Mon portefeuille', href: '/client/wallet', icon: WalletCards },",
                $content,
            );
        }

        return $content;
    },
    $stamp,
);

/*
 * CheckoutController : props portefeuille + paiement par portefeuille.
 */
patchFile(
    $root.'/app/Http/Controllers/CheckoutController.php',
    function (string $content): string {
        if (! str_contains($content, 'App\Services\Wallet\WalletService')) {
            $content = str_replace(
                'use App\Services\CreateServicesFromOrder;',
                "use App\Services\CreateServicesFromOrder;\n"
                .'use App\Services\Wallet\WalletService;',
                $content,
            );
        }

        if (! str_contains($content, "'wallet' => [")) {
            $content = str_replace(
                "            'paymentIntentId' => \$paymentIntent->id,",
                "            'paymentIntentId' => \$paymentIntent->id,\n"
                ."            'wallet' => [\n"
                ."                'balance_cents' => app(WalletService::class)\n"
                ."                    ->walletFor(\$request->user())\n"
                ."                    ->balance_cents,\n"
                ."                'can_pay' => app(WalletService::class)\n"
                ."                    ->walletFor(\$request->user())\n"
                ."                    ->balance_cents >= \$checkout['summary']['due_today_cents'],\n"
                ."            ],",
                $content,
            );
        }

        if (! str_contains($content, "if (\$action === 'wallet')")) {
            $content = str_replace(
                "        if (\$action === 'validate') {\n"
                ."            return response()->json(['ok' => true]);\n"
                ."        }\n",
                "        if (\$action === 'validate') {\n"
                ."            return response()->json(['ok' => true]);\n"
                ."        }\n\n"
                ."        if (\$action === 'wallet') {\n"
                ."            return \$this->payWithWallet(\$request, \$validated);\n"
                ."        }\n",
                $content,
            );
        }

        if (! str_contains($content, 'private function payWithWallet')) {
            $needle = '    public function success(';

            $method = <<<'PHP'
    private function payWithWallet(
        Request $request,
        array $validated,
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
            $reference,
        ): Order {
            app(WalletService::class)->debit(
                $request->user(),
                $checkout['summary']['due_today_cents'],
                'order_payment',
                'wallet',
                'wallet-order:'.$reference,
                'Paiement d’une commande Astreon',
                null,
                ['checkout_reference' => $reference],
            );

            $order = Order::query()->create([
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
                'billing_country' => strtoupper(
                    $validated['billing_country'],
                ),
                'terms_accepted' => true,
                'terms_accepted_at' => now(),
                'payment_provider' => 'wallet',
                'payment_reference' => $reference,
                'paid_at' => now(),
                'metadata' => [
                    'source' => 'astreon_wallet',
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

            return $order;
        }, 3);

        try {
            app(CreateServicesFromOrder::class)->handle($order);
        } catch (Throwable $exception) {
            report($exception);
        }

        $request->session()->forget([
            'cart',
            'cart_options',
            'checkout_payment_intent_id',
            'checkout_payment_fingerprint',
        ]);

        $request->session()->flash(
            'success',
            'Commande payée avec votre portefeuille Astreon.',
        );

        return response()->json([
            'ok' => true,
            'redirect' => '/client/services',
        ]);
    }

PHP;

            $content = str_replace($needle, $method.$needle, $content);
        }

        return $content;
    },
    $stamp,
);

/*
 * Checkout React : sélection Carte / Portefeuille.
 */
patchFile(
    $root.'/resources/js/pages/store/checkout.tsx',
    function (string $content): string {
        if (! str_contains($content, 'WalletCards')) {
            $content = str_replace(
                'CreditCard, LockKeyhole, ShieldCheck',
                'CreditCard, LockKeyhole, ShieldCheck, WalletCards',
                $content,
            );
        }

        if (! str_contains($content, 'wallet: {')) {
            $content = str_replace(
                '    paymentIntentId: string;',
                "    paymentIntentId: string;\n"
                ."    wallet: {\n"
                ."        balance_cents: number;\n"
                ."        can_pay: boolean;\n"
                ."    };",
                $content,
            );

            $content = str_replace(
                'export default function Checkout({ items, summary, customer, stripeKey, clientSecret, paymentIntentId }: Props) {',
                'export default function Checkout({ items, summary, customer, stripeKey, clientSecret, paymentIntentId, wallet }: Props) {',
                $content,
            );
        }

        if (! str_contains($content, "useState<'card' | 'wallet'>")) {
            $content = str_replace(
                '    const [paymentError, setPaymentError] = useState<string | null>(null);',
                "    const [paymentError, setPaymentError] = useState<string | null>(null);\n"
                ."    const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');",
                $content,
            );
        }

        if (! str_contains($content, "action: 'wallet'")) {
            $needle = "        try {\n            await jsonPost('/checkout', { action: 'validate', ...payload() });";

            $replacement = "        try {\n"
                ."            await jsonPost('/checkout', { action: 'validate', ...payload() });\n\n"
                ."            if (paymentMethod === 'wallet') {\n"
                ."                const finalized = await jsonPost('/checkout', {\n"
                ."                    action: 'wallet',\n"
                ."                    wallet_reference: crypto.randomUUID(),\n"
                ."                    ...payload(),\n"
                ."                });\n\n"
                ."                window.location.assign(finalized.redirect ?? '/client/services');\n"
                ."                return;\n"
                ."            }";

            $content = str_replace($needle, $replacement, $content);
        }

        $content = str_replace(
            '        if (!stripeRef.current || !elementsRef.current || !ready || paying) return;',
            "        if (paying) return;\n"
            ."        if (\n"
            ."            paymentMethod === 'card'\n"
            ."            && (!stripeRef.current || !elementsRef.current || !ready)\n"
            ."        ) return;",
            $content,
        );

        if (! str_contains($content, 'Choisissez votre moyen de paiement')) {
            $needle = '                            <article className="rounded-3xl border border-purple-500/25 bg-[#130d25]/90 p-7 shadow-2xl shadow-purple-950/20">\n                                <div className="flex items-center gap-3"><CreditCard';

            $block = <<<'TSX'
                            <article className="rounded-3xl border border-purple-500/25 bg-[#130d25]/90 p-7">
                                <h2 className="text-xl font-black">
                                    Choisissez votre moyen de paiement
                                </h2>

                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('card')}
                                        className={`rounded-2xl border p-5 text-left transition ${
                                            paymentMethod === 'card'
                                                ? 'border-violet-400 bg-violet-500/15 ring-2 ring-violet-500/20'
                                                : 'border-violet-400/15 bg-[#0d0819]'
                                        }`}
                                    >
                                        <CreditCard className="h-6 w-6 text-violet-300" />
                                        <p className="mt-3 font-black">
                                            Carte bancaire
                                        </p>
                                        <p className="mt-1 text-sm text-slate-400">
                                            Paiement sécurisé par Stripe.
                                        </p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('wallet')}
                                        disabled={!wallet.can_pay}
                                        className={`rounded-2xl border p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
                                            paymentMethod === 'wallet'
                                                ? 'border-emerald-400 bg-emerald-500/15 ring-2 ring-emerald-500/20'
                                                : 'border-violet-400/15 bg-[#0d0819]'
                                        }`}
                                    >
                                        <WalletCards className="h-6 w-6 text-emerald-300" />
                                        <p className="mt-3 font-black">
                                            Portefeuille Astreon
                                        </p>
                                        <p className="mt-1 text-sm text-slate-400">
                                            Solde : {euro.format(wallet.balance_cents / 100)}
                                        </p>
                                        {!wallet.can_pay && (
                                            <p className="mt-2 text-xs font-bold text-amber-300">
                                                Solde insuffisant.
                                            </p>
                                        )}
                                    </button>
                                </div>
                            </article>

TSX;

            $content = str_replace($needle, $block.$needle, $content);
        }

        $content = str_replace(
            '<article className="rounded-3xl border border-purple-500/25 bg-[#130d25]/90 p-7 shadow-2xl shadow-purple-950/20">\n                                <div className="flex items-center gap-3"><CreditCard',
            "{paymentMethod === 'card' && (\n"
            ."                            <article className=\"rounded-3xl border border-purple-500/25 bg-[#130d25]/90 p-7 shadow-2xl shadow-purple-950/20\">\n"
            ."                                <div className=\"flex items-center gap-3\"><CreditCard",
            $content,
        );

        $content = str_replace(
            '                                </div>\n                            </article>\n\n                            <article className="rounded-3xl border border-purple-500/25 bg-[#130d25]/90 p-7">\n                                <h2 className="text-xl font-black">Services commandés</h2>',
            "                                </div>\n"
            ."                            </article>\n"
            ."                            )}\n\n"
            ."                            <article className=\"rounded-3xl border border-purple-500/25 bg-[#130d25]/90 p-7\">\n"
            ."                                <h2 className=\"text-xl font-black\">Services commandés</h2>",
            $content,
        );

        $content = str_replace(
            'disabled={!ready || paying}',
            "disabled={\n"
            ."                                paying\n"
            ."                                || (paymentMethod === 'card' && !ready)\n"
            ."                                || (paymentMethod === 'wallet' && !wallet.can_pay)\n"
            ."                            }",
            $content,
        );

        $content = str_replace(
            "{paying ? 'Paiement en cours…' : `Payer ${euro.format(summary.due_today_cents / 100)}`}",
            "{paying\n"
            ."                                ? 'Paiement en cours…'\n"
            ."                                : paymentMethod === 'wallet'\n"
            ."                                  ? `Payer avec le portefeuille — ${euro.format(summary.due_today_cents / 100)}`\n"
            ."                                  : `Payer par carte — ${euro.format(summary.due_today_cents / 100)}`}",
            $content,
        );

        return $content;
    },
    $stamp,
);

/*
 * Admin UserController : données portefeuille.
 */
patchFile(
    $root.'/app/Http/Controllers/Admin/UserController.php',
    function (string $content): string {
        if (! str_contains($content, 'App\Services\Wallet\WalletService')) {
            $content = preg_replace(
                '/(namespace App\\\\Http\\\\Controllers\\\\Admin;\R)/',
                "$1\nuse App\\Services\\Wallet\\WalletService;\n",
                $content,
                1,
            );
        }

        if (! str_contains($content, "'wallet' => [")) {
            $needle = "        return Inertia::render('admin/users/show', [";

            $insert = <<<'PHP'
        $wallet = app(WalletService::class)->walletFor($user);

        $walletTransactions = $wallet->transactions()
            ->latest()
            ->limit(15)
            ->get()
            ->map(fn ($transaction): array => [
                'id' => $transaction->id,
                'direction' => $transaction->direction,
                'source' => $transaction->source,
                'amount_cents' => $transaction->amount_cents,
                'balance_after_cents' => $transaction->balance_after_cents,
                'description' => $transaction->description,
                'created_at' => $transaction->created_at?->toIso8601String(),
            ])
            ->values()
            ->all();

PHP;

            $content = str_replace($needle, $insert.$needle, $content);

            $content = str_replace(
                "            'stripe_error' => \$stripeError,",
                "            'stripe_error' => \$stripeError,\n"
                ."            'wallet' => [\n"
                ."                'balance_cents' => \$wallet->balance_cents,\n"
                ."                'currency' => \$wallet->currency,\n"
                ."            ],\n"
                ."            'wallet_transactions' => \$walletTransactions,",
                $content,
            );
        }

        return $content;
    },
    $stamp,
);

/*
 * Admin user show : gestion du solde.
 */
patchFile(
    $root.'/resources/js/pages/admin/users/show.tsx',
    function (string $content): string {
        if (! str_contains($content, 'wallet_transactions:')) {
            $content = str_replace(
                '    stripe_error?: string | null;',
                "    stripe_error?: string | null;\n"
                ."    wallet: {\n"
                ."        balance_cents: number;\n"
                ."        currency: string;\n"
                ."    };\n"
                ."    wallet_transactions: Array<{\n"
                ."        id: number;\n"
                ."        direction: 'credit' | 'debit';\n"
                ."        source: string;\n"
                ."        amount_cents: number;\n"
                ."        balance_after_cents: number;\n"
                ."        description?: string | null;\n"
                ."        created_at?: string | null;\n"
                ."    }>;",
                $content,
            );

            $content = str_replace(
                '    stripe_error,\n}: Props)',
                "    stripe_error,\n"
                ."    wallet,\n"
                ."    wallet_transactions,\n"
                ."}: Props)",
                $content,
            );
        }

        if (! str_contains($content, 'const walletForm = useForm')) {
            $content = str_replace(
                '    const [copied, setCopied] = useState(false);',
                "    const [copied, setCopied] = useState(false);\n"
                ."    const walletForm = useForm({\n"
                ."        operation: 'credit',\n"
                ."        amount_cents: 1000,\n"
                ."        reason: '',\n"
                ."    });",
                $content,
            );
        }

        if (! str_contains($content, 'Portefeuille client')) {
            $needle = '            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">';

            $section = <<<'TSX'
            <section className="mt-6 rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5 sm:p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[.2em] text-violet-400">
                            Portefeuille client
                        </p>
                        <p className="mt-3 text-4xl font-black text-white">
                            {euro.format(wallet.balance_cents / 100)}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            Crédit interne Astreon disponible sur le compte.
                        </p>
                    </div>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            walletForm.post(
                                `/admin/users/${user.id}/wallet/adjust`,
                                { preserveScroll: true },
                            );
                        }}
                        className="grid w-full gap-3 rounded-2xl border border-violet-400/15 bg-[#0d0918] p-4 sm:grid-cols-[150px_150px_1fr_auto] xl:max-w-4xl"
                    >
                        <select
                            value={walletForm.data.operation}
                            onChange={(event) =>
                                walletForm.setData(
                                    'operation',
                                    event.target.value,
                                )
                            }
                            className="rounded-xl border border-violet-400/20 bg-[#110d20] px-4 py-3 text-sm font-bold text-white"
                        >
                            <option value="credit">Créditer</option>
                            <option value="debit">Débiter</option>
                        </select>

                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={walletForm.data.amount_cents / 100}
                            onChange={(event) =>
                                walletForm.setData(
                                    'amount_cents',
                                    Math.round(
                                        Number(event.target.value) * 100,
                                    ),
                                )
                            }
                            className="rounded-xl border border-violet-400/20 bg-[#110d20] px-4 py-3 text-sm font-bold text-white"
                            placeholder="Montant €"
                        />

                        <input
                            value={walletForm.data.reason}
                            onChange={(event) =>
                                walletForm.setData(
                                    'reason',
                                    event.target.value,
                                )
                            }
                            className="rounded-xl border border-violet-400/20 bg-[#110d20] px-4 py-3 text-sm text-white"
                            placeholder="Motif obligatoire"
                        />

                        <button
                            type="submit"
                            disabled={walletForm.processing}
                            className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-black text-white disabled:opacity-50"
                        >
                            Appliquer
                        </button>
                    </form>
                </div>

                <div className="mt-6 divide-y divide-violet-400/10">
                    {wallet_transactions.length === 0 && (
                        <p className="py-6 text-center text-sm text-slate-500">
                            Aucune transaction.
                        </p>
                    )}

                    {wallet_transactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between gap-5 py-4 text-sm"
                        >
                            <div>
                                <p className="font-black">
                                    {transaction.description
                                        ?? transaction.source}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {transaction.created_at
                                        ? new Date(
                                            transaction.created_at,
                                        ).toLocaleString('fr-FR')
                                        : '—'}
                                </p>
                            </div>

                            <div className="text-right">
                                <p
                                    className={`font-black ${
                                        transaction.direction === 'credit'
                                            ? 'text-emerald-300'
                                            : 'text-rose-300'
                                    }`}
                                >
                                    {transaction.direction === 'credit'
                                        ? '+'
                                        : '-'}
                                    {euro.format(
                                        transaction.amount_cents / 100,
                                    )}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Solde{' '}
                                    {euro.format(
                                        transaction.balance_after_cents
                                            / 100,
                                    )}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

TSX;

            $content = str_replace($needle, $section.$needle, $content);
        }

        return $content;
    },
    $stamp,
);

passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan migrate');
passthru(PHP_BINARY.' artisan route:list --path=wallet');

echo "\nPortefeuille Astreon V29 installé.\n";
echo "Exécutez composer dump-autoload puis npm run build.\n";
