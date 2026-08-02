import { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

type User = {
    id: number;
    name: string;
    email: string;
};

type Order = {
    id: number;
    reference: string;
    status: string;
    currency: string;
    total_cents: number;
    billing_name: string;
    billing_email: string;
    created_at: string;
    items_count: number;
    user: User | null;
};

type Pagination = {
    data: Order[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    orders: Pagination;
    filters: {
        search: string;
        status: string;
    };
    statuses: Record<string, string>;
    statistics: {
        total: number;
        pending: number;
        paid: number;
        active: number;
        revenue_cents: number;
    };
};

const euro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

function statusClass(status: string): string {
    if (status === 'paid' || status === 'active') {
        return 'bg-emerald-400/10 text-emerald-300';
    }

    if (status === 'pending_payment' || status === 'provisioning') {
        return 'bg-amber-400/10 text-amber-300';
    }

    if (status === 'cancelled' || status === 'failed') {
        return 'bg-red-400/10 text-red-300';
    }

    return 'bg-slate-400/10 text-slate-300';
}

export default function OrdersIndex({
    orders,
    filters,
    statuses,
    statistics,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        router.get(
            '/admin/orders',
            {
                search: search || undefined,
                status: status || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const reset = (): void => {
        setSearch('');
        setStatus('');

        router.get('/admin/orders', {}, {
            preserveState: true,
            replace: true,
        });
    };

    const cards = [
        ['Total', statistics.total],
        ['Paiement en attente', statistics.pending],
        ['Payées', statistics.paid],
        ['Actives', statistics.active],
    ];

    return (
        <>
            <Head title="Commandes — Administration AstreonHeberg" />

            <div className="min-h-screen bg-[#f5f7fb] px-6 py-10 text-slate-950">
                <main className="mx-auto max-w-7xl">
                    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div>
                            <Link
                                href="/admin"
                                className="text-sm font-bold text-slate-500 hover:text-slate-950"
                            >
                                ← Tableau de bord
                            </Link>

                            <p className="mt-6 text-sm font-black uppercase tracking-[0.2em] text-emerald-400">
                                Ventes
                            </p>

                            <h1 className="mt-3 text-4xl font-black">
                                Commandes
                            </h1>

                            <p className="mt-3 text-slate-500">
                                Consultez les commandes et gérez leur traitement.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-6 py-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                                Chiffre encaissé
                            </p>

                            <p className="mt-2 text-2xl font-black">
                                {euro.format(
                                    statistics.revenue_cents / 100,
                                )}
                            </p>
                        </div>
                    </div>

                    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {cards.map(([label, value]) => (
                            <article
                                key={String(label)}
                                className="rounded-2xl border border-slate-200 bg-white p-5"
                            >
                                <p className="text-sm text-slate-500">
                                    {label}
                                </p>

                                <p className="mt-3 text-3xl font-black">
                                    {value}
                                </p>
                            </article>
                        ))}
                    </section>

                    <form
                        onSubmit={submit}
                        className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 md:grid-cols-[1fr_240px_auto]"
                    >
                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Référence, client ou e-mail..."
                            className="rounded-xl border border-slate-200 bg-slate-950 px-4 py-3 outline-none focus:border-blue-400"
                        />

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value)
                            }
                            className="rounded-xl border border-slate-200 bg-slate-950 px-4 py-3"
                        >
                            <option value="">Tous les statuts</option>

                            {Object.entries(statuses).map(
                                ([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ),
                            )}
                        </select>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="rounded-xl bg-blue-500 px-5 py-3 font-black"
                            >
                                Filtrer
                            </button>

                            <button
                                type="button"
                                onClick={reset}
                                className="rounded-xl border border-slate-200 px-4 py-3 font-bold"
                            >
                                Effacer
                            </button>
                        </div>
                    </form>

                    <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="border-b border-slate-200 bg-white/[0.03]">
                                    <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                                        <th className="px-6 py-4">
                                            Commande
                                        </th>
                                        <th className="px-6 py-4">
                                            Client
                                        </th>
                                        <th className="px-6 py-4">
                                            Articles
                                        </th>
                                        <th className="px-6 py-4">
                                            Total
                                        </th>
                                        <th className="px-6 py-4">
                                            Statut
                                        </th>
                                        <th className="px-6 py-4">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-white/10">
                                    {orders.data.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-white/[0.03]"
                                        >
                                            <td className="px-6 py-5">
                                                <p className="font-black">
                                                    {order.reference}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    #{order.id}
                                                </p>
                                            </td>

                                            <td className="px-6 py-5">
                                                <p className="font-bold">
                                                    {order.user?.name ??
                                                        order.billing_name}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {order.user?.email ??
                                                        order.billing_email}
                                                </p>
                                            </td>

                                            <td className="px-6 py-5 font-bold">
                                                {order.items_count}
                                            </td>

                                            <td className="px-6 py-5 font-black">
                                                {euro.format(
                                                    order.total_cents / 100,
                                                )}
                                            </td>

                                            <td className="px-6 py-5">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                                                        order.status,
                                                    )}`}
                                                >
                                                    {statuses[order.status] ??
                                                        order.status}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5 text-sm text-slate-500">
                                                {dateFormatter.format(
                                                    new Date(order.created_at),
                                                )}
                                            </td>

                                            <td className="px-6 py-5 text-right">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold hover:bg-white/5"
                                                >
                                                    Consulter
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}

                                    {orders.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-6 py-14 text-center text-slate-500"
                                            >
                                                Aucune commande trouvée.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                {orders.from ?? 0} à {orders.to ?? 0} sur{' '}
                                {orders.total} commandes
                            </p>

                            <div className="flex gap-2">
                                {orders.prev_page_url && (
                                    <Link
                                        href={orders.prev_page_url}
                                        preserveScroll
                                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"
                                    >
                                        Précédent
                                    </Link>
                                )}

                                <span className="rounded-xl bg-white/5 px-4 py-2 text-sm font-bold">
                                    Page {orders.current_page} /{' '}
                                    {orders.last_page}
                                </span>

                                {orders.next_page_url && (
                                    <Link
                                        href={orders.next_page_url}
                                        preserveScroll
                                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"
                                    >
                                        Suivant
                                    </Link>
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}