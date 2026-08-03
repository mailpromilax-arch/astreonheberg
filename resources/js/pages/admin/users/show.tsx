import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Ban,
    CheckCircle2,
    Copy,
    CreditCard,
    KeyRound,
    LifeBuoy,
    Save,
    Server,
    ShieldOff,
    ShoppingCart,
    UserRoundCog,
    WalletCards,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import AdminShell from './admin-shell';

type RecordValue = string | number | boolean | null | undefined;

type Props = {
    user: Record<string, RecordValue>;
    services: Array<Record<string, RecordValue>>;
    orders: Array<Record<string, RecordValue>>;
    payments: Array<Record<string, RecordValue>>;
    temporary_password?: string | null;
    stripe_payment_methods: Array<{
        id: string;
        brand: string;
        last4: string;
        exp_month?: number | null;
        exp_year?: number | null;
    }>;
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
    tickets: Array<Record<string, RecordValue>>;
    stats: {
        services: number;
        orders: number;
        payments: number;
        tickets: number;
    };
    capabilities: {
        has_status: boolean;
        has_role: boolean;
        has_two_factor: boolean;
        two_factor_enabled: boolean;
        two_factor_confirmed: boolean;
    };
};

type Flash = {
    success?: string;
    temporary_password?: string;
};

const euro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

function text(value: RecordValue): string {
    return value === null || value === undefined ? '—' : String(value);
}

export default function AdminUserShow({
    user,
    services,
    orders,
    payments,
    tickets,
    stats,
    capabilities,
    temporary_password,
    stripe_payment_methods,
    stripe_error,
    wallet,
    wallet_transactions,
}: Props) {
    const flash = usePage<{ flash?: Flash }>().props.flash;
    const [copied, setCopied] = useState(false);

    const walletForm = useForm({
        operation: 'credit',
        amount_cents: 1000,
        reason: '',
    });

    const form = useForm({
        name: text(user.name) === '—' ? '' : text(user.name),
        email: text(user.email) === '—' ? '' : text(user.email),
        role: text(user.role) === '—' ? 'client' : text(user.role),
        status:
            text(user.status) === '—' ? 'active' : text(user.status),
        first_name:
            text(user.first_name) === '—' ? '' : text(user.first_name),
        last_name:
            text(user.last_name) === '—' ? '' : text(user.last_name),
        company_name:
            text(user.company_name) === '—' ? '' : text(user.company_name),
        phone: text(user.phone) === '—' ? '' : text(user.phone),
        address_line_1:
            text(user.address_line_1) === '—'
                ? ''
                : text(user.address_line_1),
        address_line_2:
            text(user.address_line_2) === '—'
                ? ''
                : text(user.address_line_2),
        postal_code:
            text(user.postal_code) === '—'
                ? ''
                : text(user.postal_code),
        city: text(user.city) === '—' ? '' : text(user.city),
        region:
            text(user.region) === '—' ? '' : text(user.region),
        country:
            text(user.country) === '—' ? '' : text(user.country),
        locale:
            text(user.locale) === '—' ? '' : text(user.locale),
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.put(`/admin/users/${user.id}`);
    }

    function postAction(path: string, confirmation: string) {
        if (!window.confirm(confirmation)) {
            return;
        }

        router.post(path, {}, { preserveScroll: true });
    }

    async function copyPassword() {
        if (!temporary_password) {
            return;
        }

        await navigator.clipboard.writeText(temporary_password);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
    }

    const cards = [
        { label: 'Services', value: stats.services, icon: Server },
        { label: 'Commandes', value: stats.orders, icon: ShoppingCart },
        { label: 'Paiements', value: stats.payments, icon: CreditCard },
        { label: 'Tickets', value: stats.tickets, icon: LifeBuoy },
    ];

    return (
        <AdminShell>
            <Head title={`Client · ${text(user.name)}`} />

            <Link
                href="/admin/users"
                className="inline-flex items-center gap-2 text-sm font-black text-violet-300"
            >
                <ArrowLeft className="h-4 w-4" />
                Retour aux clients
            </Link>

            <section className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[.28em] text-violet-400">
                        Fiche client #{text(user.id)}
                    </p>
                    <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                        {text(user.name)}
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        {text(user.email)}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            postAction(
                                `/admin/users/${user.id}/temporary-password`,
                                'Générer un nouveau mot de passe temporaire ?',
                            )
                        }
                        className="inline-flex h-11 items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 text-sm font-black text-violet-200"
                    >
                        <KeyRound className="h-4 w-4" />
                        Mot de passe temporaire
                    </button>

                    {capabilities.two_factor_enabled && (
                        <button
                            type="button"
                            onClick={() =>
                                postAction(
                                    `/admin/users/${user.id}/disable-2fa`,
                                    'Désactiver la double authentification ?',
                                )
                            }
                            className="inline-flex h-11 items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 text-sm font-black text-amber-200"
                        >
                            <ShieldOff className="h-4 w-4" />
                            Désactiver la 2FA
                        </button>
                    )}

                    {capabilities.has_status &&
                    user.status === 'suspended' ? (
                        <button
                            type="button"
                            onClick={() =>
                                postAction(
                                    `/admin/users/${user.id}/activate`,
                                    'Réactiver ce compte ?',
                                )
                            }
                            className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 text-sm font-black text-emerald-200"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Réactiver
                        </button>
                    ) : capabilities.has_status ? (
                        <button
                            type="button"
                            onClick={() =>
                                postAction(
                                    `/admin/users/${user.id}/suspend`,
                                    'Suspendre ce compte ?',
                                )
                            }
                            className="inline-flex h-11 items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 text-sm font-black text-rose-200"
                        >
                            <Ban className="h-4 w-4" />
                            Suspendre
                        </button>
                    ) : null}
                </div>
            </section>

            {flash?.success && (
                <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                    {flash.success}
                </div>
            )}

            {temporary_password && (
                <div className="mt-5 flex flex-col gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-wider text-amber-300">
                            Mot de passe temporaire
                        </p>
                        <code className="mt-2 block text-lg font-black text-white">
                            {temporary_password}
                        </code>
                    </div>
                    <button
                        type="button"
                        onClick={copyPassword}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-400/20 px-4 text-sm font-black text-amber-100"
                    >
                        <Copy className="h-4 w-4" />
                        {copied ? 'Copié' : 'Copier'}
                    </button>
                </div>
            )}


            <section className="mt-6 rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[.2em] text-slate-500">
                            Double authentification
                        </p>
                        <p className={`mt-2 text-lg font-black ${
                            capabilities.two_factor_enabled
                                ? 'text-emerald-300'
                                : 'text-slate-400'
                        }`}>
                            {capabilities.two_factor_enabled
                                ? capabilities.two_factor_confirmed
                                    ? '2FA activée et confirmée'
                                    : '2FA activée, confirmation en attente'
                                : '2FA désactivée'}
                        </p>
                    </div>

                    {capabilities.two_factor_enabled && (
                        <button
                            type="button"
                            onClick={() =>
                                postAction(
                                    `/admin/users/${user.id}/disable-2fa`,
                                    'Désactiver la double authentification de ce client ?',
                                )
                            }
                            className="inline-flex h-11 items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 text-sm font-black text-amber-200"
                        >
                            <ShieldOff className="h-4 w-4" />
                            Supprimer la 2FA
                        </button>
                    )}
                </div>
            </section>

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
            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <article
                            key={card.label}
                            className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-400">
                                        {card.label}
                                    </p>
                                    <p className="mt-2 text-3xl font-black">
                                        {card.value}
                                    </p>
                                </div>
                                <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/10 text-violet-300">
                                    <Icon className="h-5 w-5" />
                                </span>
                            </div>
                        </article>
                    );
                })}
            </section>

            <section className="mt-6 grid gap-6 2xl:grid-cols-[1.25fr_.75fr]">
                <form
                    onSubmit={submit}
                    className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5 sm:p-6"
                >
                    <div className="flex items-center gap-3">
                        <UserRoundCog className="h-5 w-5 text-violet-300" />
                        <div>
                            <h2 className="text-lg font-black">
                                Informations du compte
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Modifiez les données principales du client.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {[
                            ['name', 'Nom complet'],
                            ['email', 'Adresse e-mail'],
                            ['first_name', 'Prénom'],
                            ['last_name', 'Nom'],
                            ['company_name', 'Entreprise'],
                            ['phone', 'Téléphone'],
                            ['address_line_1', 'Adresse 1'],
                            ['address_line_2', 'Adresse 2'],
                            ['postal_code', 'Code postal'],
                            ['city', 'Ville'],
                            ['region', 'État / Région'],
                            ['country', 'Pays'],
                            ['locale', 'Langue'],
                        ].map(([field, label]) => (
                            <label
                                key={field}
                                className={
                                    field === 'address_line_1' || field === 'address_line_2'
                                        ? 'md:col-span-2'
                                        : ''
                                }
                            >
                                <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                    {label}
                                </span>
                                <input
                                    value={
                                        form.data[
                                            field as keyof typeof form.data
                                        ]
                                    }
                                    onChange={(event) =>
                                        form.setData(
                                            field as keyof typeof form.data,
                                            event.target.value,
                                        )
                                    }
                                    className="h-12 w-full rounded-xl border border-violet-400/15 bg-black/20 px-4 text-sm text-white outline-none"
                                />
                            </label>
                        ))}

                        {capabilities.has_role && (
                            <label>
                                <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                    Rôle
                                </span>
                                <select
                                    value={form.data.role}
                                    onChange={(event) =>
                                        form.setData(
                                            'role',
                                            event.target.value,
                                        )
                                    }
                                    className="h-12 w-full rounded-xl border border-violet-400/15 bg-[#0c0917] px-4 text-sm text-white outline-none"
                                >
                                    <option value="client">Client</option>
                                    <option value="support">Support</option>
                                    <option value="admin">
                                        Administrateur
                                    </option>
                                    <option value="super_admin">
                                        Super admin
                                    </option>
                                </select>
                            </label>
                        )}

                        {capabilities.has_status && (
                            <label>
                                <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                    Statut
                                </span>
                                <select
                                    value={form.data.status}
                                    onChange={(event) =>
                                        form.setData(
                                            'status',
                                            event.target.value,
                                        )
                                    }
                                    className="h-12 w-full rounded-xl border border-violet-400/15 bg-[#0c0917] px-4 text-sm text-white outline-none"
                                >
                                    <option value="active">Actif</option>
                                    <option value="suspended">
                                        Suspendu
                                    </option>
                                    <option value="disabled">
                                        Désactivé
                                    </option>
                                    <option value="banned">Banni</option>
                                </select>
                            </label>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 text-sm font-black disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        Enregistrer
                    </button>
                </form>

                <aside className="space-y-6">
                    <InfoPanel
                        title="Services récents"
                        rows={services}
                        amountField={null}
                    />
                    <InfoPanel
                        title="Commandes récentes"
                        rows={orders}
                        amountField="total_cents"
                    />

                <section className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5">
                    <h2 className="text-lg font-black">
                        Moyens de paiement Stripe
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Seules la marque, l’expiration et les quatre derniers chiffres sont affichés.
                    </p>

                    {stripe_error && (
                        <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                            {stripe_error}
                        </div>
                    )}

                    <div className="mt-4 space-y-3">
                        {stripe_payment_methods.map((method) => (
                            <div
                                key={method.id}
                                className="flex flex-col gap-3 rounded-xl border border-white/5 bg-black/10 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <p className="text-sm font-black uppercase">
                                        {method.brand} •••• {method.last4}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Expire {method.exp_month}/{method.exp_year}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                'Supprimer ce moyen de paiement Stripe ?',
                                            )
                                        ) {
                                            router.delete(
                                                `/admin/users/${user.id}/stripe-payment-methods/${method.id}`,
                                                { preserveScroll: true },
                                            );
                                        }
                                    }}
                                    className="inline-flex h-10 items-center rounded-xl bg-rose-500/10 px-4 text-sm font-black text-rose-300"
                                >
                                    Supprimer
                                </button>
                            </div>
                        ))}

                        {stripe_payment_methods.length === 0 && !stripe_error && (
                            <p className="rounded-xl border border-dashed border-violet-400/15 p-8 text-center text-sm text-slate-500">
                                Aucun moyen de paiement Stripe enregistré.
                            </p>
                        )}
                    </div>
                </section>

                    <InfoPanel
                        title="Paiements récents"
                        rows={payments}
                        amountField="amount_cents"
                    />
                    <InfoPanel
                        title="Tickets récents"
                        rows={tickets}
                        amountField={null}
                    />
                </aside>
            </section>
        </AdminShell>
    );
}

function InfoPanel({
    title,
    rows,
    amountField,
}: {
    title: string;
    rows: Array<Record<string, RecordValue>>;
    amountField: string | null;
}) {
    return (
        <article className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5">
            <h2 className="font-black">{title}</h2>

            <div className="mt-4 space-y-2">
                {rows.length === 0 && (
                    <p className="py-6 text-center text-sm text-slate-500">
                        Aucun élément.
                    </p>
                )}

                {rows.map((row) => (
                    <div
                        key={String(row.id)}
                        className="rounded-xl border border-white/5 bg-black/10 p-3"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-black">
                                    {text(
                                        row.reference ??
                                            row.name ??
                                            row.subject ??
                                            row.title ??
                                            `#${text(row.id)}`,
                                    )}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {text(row.status)}
                                </p>
                            </div>

                            {amountField &&
                                typeof row[amountField] === 'number' && (
                                    <span className="shrink-0 text-sm font-black text-violet-300">
                                        {euro.format(
                                            Number(row[amountField]) / 100,
                                        )}
                                    </span>
                                )}
                        </div>
                    </div>
                ))}
            </div>
        </article>
    );
}
