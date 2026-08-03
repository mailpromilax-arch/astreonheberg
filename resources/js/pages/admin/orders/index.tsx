import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Filter,
    Search,
    ShoppingCart,
    XCircle,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import AdminShell from './admin-shell';

type Order = {
    id: number;
    reference: string;
    status: string;
    currency: string;
    total_cents: number;
    paid_at?: string | null;
    created_at?: string | null;
    customer?: {
        id: number;
        name: string;
        email: string;
    } | null;
};

type Pagination = {
    data: Order[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    orders: Pagination;
    filters: {
        search: string;
        status: string;
    };
    counts: {
        total: number;
        paid: number;
        pending: number;
        failed: number;
    };
    revenue: {
        month_cents: number;
        total_cents: number;
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
    if (['paid', 'completed', 'active'].includes(status)) {
        return 'bg-emerald-500/10 text-emerald-300';
    }

    if (['failed', 'cancelled', 'canceled', 'refused'].includes(status)) {
        return 'bg-rose-500/10 text-rose-300';
    }

    return 'bg-amber-500/10 text-amber-300';
}

export default function AdminOrdersIndex({
    orders,
    filters,
    counts,
    revenue,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);

    function submit(event: FormEvent) {
        event.preventDefault();

        router.get(
            '/admin/orders',
            { search, status },
            { preserveState: true, replace: true },
        );
    }

    const cards = [
        { label: 'Commandes', value: counts.total, icon: ShoppingCart },
        { label: 'Payées', value: counts.paid, icon: CheckCircle2 },
        { label: 'En attente', value: counts.pending, icon: Clock3 },
        { label: 'Échouées', value: counts.failed, icon: XCircle },
    ];

    return (
        <AdminShell>
            <Head title="Gestion des commandes" />

            <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[.28em] text-violet-400">
                        Administration · Commandes
                    </p>
                    <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                        Suivi des commandes
                    </h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                        Retrouvez les commandes, statuts de paiement, clients,
                        montants et services livrés.
                    </p>
                </div>

                <div className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 px-5 py-4">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Chiffre d’affaires
                    </p>
                    <p className="mt-2 text-2xl font-black text-violet-200">
                        {euro.format(revenue.month_cents / 100)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        Total : {euro.format(revenue.total_cents / 100)}
                    </p>
                </div>
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                className="mt-6 grid gap-3 rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-4 md:grid-cols-[1fr_200px_auto]"
            >
                <label className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Référence, client, e-mail, identifiant..."
                        className="h-12 w-full rounded-xl border border-violet-400/15 bg-black/20 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600"
                    />
                </label>

                <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="h-12 rounded-xl border border-violet-400/15 bg-[#0c0917] px-4 text-sm text-white outline-none"
                >
                    <option value="">Tous les statuts</option>
                    <option value="created">Créée</option>
                    <option value="pending">En attente</option>
                    <option value="processing">Traitement</option>
                    <option value="paid">Payée</option>
                    <option value="completed">Terminée</option>
                    <option value="failed">Échouée</option>
                    <option value="cancelled">Annulée</option>
                    <option value="refunded">Remboursée</option>
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
                                <th className="px-5 py-4">Commande</th>
                                <th className="px-5 py-4">Client</th>
                                <th className="px-5 py-4">Date</th>
                                <th className="px-5 py-4">Montant</th>
                                <th className="px-5 py-4">Statut</th>
                                <th className="px-5 py-4 text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-violet-400/10">
                            {orders.data.map((order) => (
                                <tr
                                    key={order.id}
                                    className="transition hover:bg-violet-500/5"
                                >
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-black">
                                            {order.reference}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            ID #{order.id}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        <p className="text-sm font-black">
                                            {order.customer?.name ?? '—'}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {order.customer?.email ?? '—'}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-500">
                                        {order.created_at
                                            ? date.format(
                                                  new Date(order.created_at),
                                              )
                                            : '—'}
                                    </td>

                                    <td className="px-5 py-4 text-sm font-black text-violet-200">
                                        {euro.format(order.total_cents / 100)}
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(order.status)}`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-right">
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="inline-flex h-10 items-center rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 text-sm font-black text-violet-200 hover:bg-violet-500/20"
                                        >
                                            Consulter
                                        </Link>
                                    </td>
                                </tr>
                            ))}

                            {orders.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-16 text-center text-sm text-slate-500"
                                    >
                                        Aucune commande ne correspond aux filtres.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-violet-400/15 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        {orders.from ?? 0}–{orders.to ?? 0} sur {orders.total}
                    </p>

                    <div className="flex gap-2">
                        {orders.prev_page_url ? (
                            <Link
                                href={orders.prev_page_url}
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
                            {orders.current_page}/{orders.last_page}
                        </span>

                        {orders.next_page_url ? (
                            <Link
                                href={orders.next_page_url}
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
