<?php

declare(strict_types=1);

$root = __DIR__;
$stamp = date('Ymd-His');

function patchFile(
    string $path,
    callable $callback,
    string $stamp,
): void {
    if (! is_file($path)) {
        fwrite(STDERR, "Fichier introuvable : {$path}\n");
        exit(1);
    }

    $content = file_get_contents($path);
    copy($path, $path.'.backup-'.$stamp);

    $updated = $callback($content);

    if (! is_string($updated) || $updated === '') {
        fwrite(STDERR, "Échec de modification : {$path}\n");
        exit(1);
    }

    file_put_contents($path, $updated);

    echo "Modifié : {$path}\n";
}

/*
|--------------------------------------------------------------------------
| Contrôleur admin : charger le portefeuille du client
|--------------------------------------------------------------------------
*/
patchFile(
    $root.'/app/Http/Controllers/Admin/UserController.php',
    function (string $content): string {
        if (! str_contains(
            $content,
            'use App\Services\Wallet\WalletService;',
        )) {
            $content = str_replace(
                'use App\Services\Notifications\NotificationCenter;',
                "use App\\Services\\Notifications\\NotificationCenter;\n"
                .'use App\Services\Wallet\WalletService;',
                $content,
            );
        }

        if (! str_contains(
            $content,
            '$walletTransactions = $wallet->transactions()',
        )) {
            $needle = <<<'PHP'
        return Inertia::render('admin/users/show', [
PHP;

            $insert = <<<'PHP'
        $wallet = app(WalletService::class)->walletFor($user);

        $walletTransactions = $wallet->transactions()
            ->latest()
            ->limit(20)
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

            if (! str_contains($content, $needle)) {
                fwrite(
                    STDERR,
                    "Point d'insertion Inertia introuvable dans UserController.\n",
                );
                exit(1);
            }

            $content = str_replace(
                $needle,
                $insert.$needle,
                $content,
            );
        }

        if (! str_contains($content, "'wallet_transactions' =>")) {
            $needle = <<<'PHP'
            'stripe_error' => $stripeError,
PHP;

            $replacement = <<<'PHP'
            'stripe_error' => $stripeError,
            'wallet' => [
                'balance_cents' => $wallet->balance_cents,
                'currency' => $wallet->currency,
            ],
            'wallet_transactions' => $walletTransactions,
PHP;

            if (! str_contains($content, $needle)) {
                fwrite(
                    STDERR,
                    "Prop stripe_error introuvable dans UserController.\n",
                );
                exit(1);
            }

            $content = str_replace(
                $needle,
                $replacement,
                $content,
            );
        }

        return $content;
    },
    $stamp,
);

/*
|--------------------------------------------------------------------------
| Page admin client : afficher et modifier le portefeuille
|--------------------------------------------------------------------------
*/
patchFile(
    $root.'/resources/js/pages/admin/users/show.tsx',
    function (string $content): string {
        if (! str_contains($content, 'WalletCards')) {
            $content = str_replace(
                '    UserRoundCog,',
                "    UserRoundCog,\n"
                .'    WalletCards,',
                $content,
            );
        }

        if (! str_contains($content, 'wallet_transactions: Array<')) {
            $needle = <<<'TSX'
    stripe_error?: string | null;
TSX;

            $props = <<<'TSX'
    stripe_error?: string | null;
    wallet: {
        balance_cents: number;
        currency: string;
    };
    wallet_transactions: Array<{
        id: number;
        direction: 'credit' | 'debit';
        source: string;
        amount_cents: number;
        balance_after_cents: number;
        description?: string | null;
        created_at?: string | null;
    }>;
TSX;

            if (! str_contains($content, $needle)) {
                fwrite(STDERR, "Type stripe_error introuvable dans show.tsx.\n");
                exit(1);
            }

            $content = str_replace($needle, $props, $content);
        }

        if (! str_contains($content, '    wallet_transactions,')) {
            $needle = <<<'TSX'
    stripe_error,
}: Props) {
TSX;

            $replacement = <<<'TSX'
    stripe_error,
    wallet,
    wallet_transactions,
}: Props) {
TSX;

            if (! str_contains($content, $needle)) {
                fwrite(STDERR, "Destructuration des props introuvable.\n");
                exit(1);
            }

            $content = str_replace(
                $needle,
                $replacement,
                $content,
            );
        }

        if (! str_contains($content, 'const walletForm = useForm')) {
            $needle = <<<'TSX'
    const [copied, setCopied] = useState(false);
TSX;

            $replacement = <<<'TSX'
    const [copied, setCopied] = useState(false);

    const walletForm = useForm({
        operation: 'credit',
        amount_cents: 1000,
        reason: '',
    });
TSX;

            if (! str_contains($content, $needle)) {
                fwrite(STDERR, "État copied introuvable dans show.tsx.\n");
                exit(1);
            }

            $content = str_replace(
                $needle,
                $replacement,
                $content,
            );
        }

        if (! str_contains($content, 'Portefeuille du client')) {
            $needle = <<<'TSX'
            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
TSX;

            $section = <<<'TSX'
            <section className="mt-6 overflow-hidden rounded-2xl border border-violet-400/15 bg-[#110d20]/90">
                <div className="flex flex-col gap-5 border-b border-violet-400/10 bg-gradient-to-r from-violet-600/15 to-transparent p-5 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-4">
                        <span className="grid h-14 w-14 place-items-center rounded-2xl border border-violet-300/20 bg-violet-500/15 text-violet-200">
                            <WalletCards className="h-7 w-7" />
                        </span>

                        <div>
                            <p className="text-xs font-black uppercase tracking-[.2em] text-violet-400">
                                Portefeuille du client
                            </p>
                            <p className="mt-2 text-4xl font-black text-white">
                                {euro.format(wallet.balance_cents / 100)}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Solde disponible sur le compte Astreon.
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();

                            walletForm.post(
                                `/admin/users/${user.id}/wallet/adjust`,
                                {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        walletForm.setData(
                                            'reason',
                                            '',
                                        );
                                    },
                                },
                            );
                        }}
                        className="grid w-full gap-3 rounded-2xl border border-violet-400/15 bg-[#0d0918] p-4 sm:grid-cols-[145px_145px_1fr_auto] xl:max-w-4xl"
                    >
                        <select
                            value={walletForm.data.operation}
                            onChange={(event) =>
                                walletForm.setData(
                                    'operation',
                                    event.target.value,
                                )
                            }
                            className="rounded-xl border border-violet-400/20 bg-[#110d20] px-4 py-3 text-sm font-bold text-white outline-none"
                        >
                            <option value="credit">
                                Créditer
                            </option>
                            <option value="debit">
                                Débiter
                            </option>
                        </select>

                        <div className="flex items-center rounded-xl border border-violet-400/20 bg-[#110d20] px-4">
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={
                                    walletForm.data.amount_cents
                                    / 100
                                }
                                onChange={(event) =>
                                    walletForm.setData(
                                        'amount_cents',
                                        Math.round(
                                            Number(
                                                event.target.value,
                                            ) * 100,
                                        ),
                                    )
                                }
                                className="w-full bg-transparent py-3 text-sm font-bold text-white outline-none"
                                placeholder="Montant"
                            />
                            <span className="font-black text-violet-300">
                                €
                            </span>
                        </div>

                        <input
                            value={walletForm.data.reason}
                            onChange={(event) =>
                                walletForm.setData(
                                    'reason',
                                    event.target.value,
                                )
                            }
                            className="rounded-xl border border-violet-400/20 bg-[#110d20] px-4 py-3 text-sm text-white outline-none"
                            placeholder="Motif obligatoire"
                            required
                        />

                        <button
                            type="submit"
                            disabled={walletForm.processing}
                            className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-black text-white disabled:opacity-50"
                        >
                            {walletForm.processing
                                ? 'Traitement…'
                                : 'Appliquer'}
                        </button>
                    </form>
                </div>

                <div className="p-5 sm:p-6">
                    <h2 className="text-lg font-black">
                        Dernières opérations
                    </h2>

                    <div className="mt-4 divide-y divide-violet-400/10">
                        {wallet_transactions.length === 0 && (
                            <p className="py-8 text-center text-sm text-slate-500">
                                Aucune transaction enregistrée.
                            </p>
                        )}

                        {wallet_transactions.map(
                            (transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between gap-5 py-4"
                                >
                                    <div>
                                        <p className="text-sm font-black text-white">
                                            {transaction.description
                                                ?? transaction.source}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {transaction.created_at
                                                ? new Date(
                                                    transaction.created_at,
                                                ).toLocaleString(
                                                    'fr-FR',
                                                )
                                                : '—'}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p
                                            className={`font-black ${
                                                transaction.direction
                                                === 'credit'
                                                    ? 'text-emerald-300'
                                                    : 'text-rose-300'
                                            }`}
                                        >
                                            {transaction.direction
                                            === 'credit'
                                                ? '+'
                                                : '-'}
                                            {euro.format(
                                                transaction.amount_cents
                                                / 100,
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
                            ),
                        )}
                    </div>
                </div>
            </section>

TSX;

            if (! str_contains($content, $needle)) {
                fwrite(STDERR, "Emplacement des cartes statistiques introuvable.\n");
                exit(1);
            }

            $content = str_replace(
                $needle,
                $section.$needle,
                $content,
            );
        }

        return $content;
    },
    $stamp,
);

passthru(PHP_BINARY.' artisan optimize:clear');

echo "\nCorrectif profil admin portefeuille V30 installé.\n";
echo "Exécutez maintenant :\n";
echo "composer dump-autoload\n";
echo "npm run build\n";
