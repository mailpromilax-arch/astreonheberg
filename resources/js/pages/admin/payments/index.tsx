import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    CreditCard,
    Database,
    Filter,
    RotateCcw,
    Search,
    XCircle,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import AdminShell from './admin-shell';

type Payment = {
    id: string;
    raw_id: number;
    source: 'payment' | 'legacy_order';
    reference: string;
    provider: string;
    status: string;
    currency: string;
    amount_cents: number;
    fee_cents: number;
    refunded_cents: number;
    paid_at?: string | null;
    created_at?: string | null;
    customer?: {
        id: number;
        name: string;
        email: string;
    } | null;
    order?: {
        id: number;
        reference: string;
        status?: string | null;
    } | null;
};

type Pagination = {
    data: Payment[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    payments: Pagination;
    filters: {
        search: string;
        status: string;
        provider: string;
    };
    providers: string[];
    counts: {
        total: number;
        succeeded: number;
        pending: number;
        failed: number;
        refunded: number;
    };
    amounts: {
        month_cents: number;
        total_cents: number;
        refunded_cents: number;
    };
};

const euro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

const date = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

function statusClass(status: string): string {
    if (['paid', 'succeeded', 'completed', 'active'].includes(status)) {
        return 'bg-emerald-500/10 text-emerald-300';
    }

    if (['failed', 'refused', 'cancelled', 'canceled'].includes(status)) {
        return 'bg-rose-500/10 text-rose-300';
    }

    if (['refunded', 'partially_refunded'].includes(status)) {
        return 'bg-cyan-500/10 text-cyan-300';
    }

    return 'bg-amber-500/10 text-amber-300';
}

export default function AdminPaymentsIndex({
    payments,
    filters,
    providers,
    counts,
    amounts,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [provider, setProvider] = useState(filters.provider);

    function submit(event: FormEvent) {
        event.preventDefault();

        router.get(
            '/admin/payments',
            { search, status, provider },
            { preserveState: true, replace: true },
        );
    }

    const cards = [
        { label: 'Paiements', value: counts.total, icon: CreditCard },
        { label: 'Acceptés', value: counts.succeeded, icon: CheckCircle2 },
        { label: 'En attente', value: counts.pending, icon: Clock3 },
        { label: 'Refusés', value: counts.failed, icon: XCircle },
        { label: 'Remboursés', value: counts.refunded, icon: RotateCcw },
    ];

    return (
        <AdminShell>
            <Head title="Gestion des paiements" />

            <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[.28em] text-violet-400">
                        Administration · Paiements
                    </p>
                    <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                        Historique des paiements
                    </h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                        Les transactions récentes et les anciennes commandes
                        payées sont désormais regroupées dans un seul historique.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <AmountCard label="Ce mois" value={amounts.month_cents} />
                    <AmountCard label="Total encaissé" value={amounts.total_cents} />
                    <AmountCard label="Total remboursé" value={amounts.refunded_cents} />
                </div>
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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

            <form
                onSubmit={submit}
                className="mt-6 grid gap-3 rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-4 xl:grid-cols-[1fr_180px_180px_auto]"
            >
                <label className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Référence, transaction, client ou e-mail..."
                        className="h-12 w-full rounded-xl border border-violet-400/15 bg-black/20 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600"
                    />
                </label>

                <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="h-12 rounded-xl border border-violet-400/15 bg-[#0c0917] px-4 text-sm text-white outline-none"
                >
                    <option value="">Tous les statuts</option>
                    <option value="paid">Payé</option>
                    <option value="succeeded">Accepté</option>
                    <option value="completed">Terminé</option>
                    <option value="pending">En attente</option>
                    <option value="processing">Traitement</option>
                    <option value="failed">Échoué</option>
                    <option value="refused">Refusé</option>
                    <option value="refunded">Remboursé</option>
                </select>

                <select
                    value={provider}
                    onChange={(event) => setProvider(event.target.value)}
                    className="h-12 rounded-xl border border-violet-400/15 bg-[#0c0917] px-4 text-sm text-white outline-none"
                >
                    <option value="">Tous les prestataires</option>
                    {providers.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>

                <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-black"
                >
                    <Filter className="h-4 w-4" />
                    Filtrer
                </button>
            </form>

            <section className="mt-6 overflow-hidden rounded-2xl border border-violet-400/15 bg-[#110d20]/90">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-violet-400/15 bg-violet-500/5">
                            <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                                <th className="px-5 py-4">Paiement</th>
                                <th className="px-5 py-4">Client</th>
                                <th className="px-5 py-4">Commande</th>
                                <th className="px-5 py-4">Prestataire</th>
                                <th className="px-5 py-4">Montant</th>
                                <th className="px-5 py-4">Statut</th>
                                <th className="px-5 py-4 text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-violet-400/10">
                            {payments.data.map((payment) => (
                                <tr
                                    key={payment.id}
                                    className="transition hover:bg-violet-500/5"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-300">
                                                {payment.source === 'legacy_order'
                                                    ? <Database className="h-4 w-4" />
                                                    : <CreditCard className="h-4 w-4" />}
                                            </span>
                                            <div>
                                                <p className="text-sm font-black">
                                                    {payment.reference}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {payment.source === 'legacy_order'
                                                        ? 'Historique importé depuis commandes'
                                                        : 'Transaction de paiement'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <p className="text-sm font-black">
                                            {payment.customer?.name ?? '—'}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {payment.customer?.email ?? '—'}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        {payment.order ? (
                                            <Link
                                                href={`/admin/orders/${payment.order.id}`}
                                                className="text-sm font-black text-violet-300 hover:text-violet-200"
                                            >
                                                {payment.order.reference}
                                            </Link>
                                        ) : (
                                            <span className="text-sm text-slate-600">
                                                —
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-5 py-4">
                                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black uppercase text-slate-300">
                                            {payment.provider}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <p className="text-sm font-black text-violet-200">
                                            {euro.format(payment.amount_cents / 100)}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(payment.status)}`}
                                        >
                                            {payment.status}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-right">
                                        <Link
                                            href={`/admin/payments/${payment.id}`}
                                            className="inline-flex h-10 items-center rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 text-sm font-black text-violet-200 hover:bg-violet-500/20"
                                        >
                                            Consulter
                                        </Link>
                                    </td>
                                </tr>
                            ))}

                            {payments.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-5 py-16 text-center text-sm text-slate-500"
                                    >
                                        Aucun paiement ne correspond aux filtres.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-violet-400/15 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        {payments.from ?? 0}–{payments.to ?? 0} sur {payments.total}
                    </p>

                    <div className="flex gap-2">
                        {payments.prev_page_url ? (
                            <Link
                                href={payments.prev_page_url}
                                preserveScroll
                                className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-300"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        ) : (
                            <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/5 text-slate-700">
                                <ChevronLeft className="h-4 w-4" />
                            </span>
                        )}

                        <span className="grid h-10 min-w-12 place-items-center rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 font-black text-violet-200">
                            {payments.current_page}/{payments.last_page}
                        </span>

                        {payments.next_page_url ? (
                            <Link
                                href={payments.next_page_url}
                                preserveScroll
                                className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-300"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/5 text-slate-700">
                                <ChevronRight className="h-4 w-4" />
                            </span>
                        )}
                    </div>
                </div>
            </section>
        </AdminShell>
    );
}

function AmountCard({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <article className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 px-5 py-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                {label}
            </p>
            <p className="mt-2 text-xl font-black text-violet-200">
                {euro.format(value / 100)}
            </p>
        </article>
    );
}
