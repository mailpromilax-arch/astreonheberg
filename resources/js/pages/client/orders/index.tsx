import { Head, Link } from '@inertiajs/react';

type Order = {
    id: number;
    reference: string;
    status: string;
    total_cents: number;
    created_at: string;
    items_count: number;
};

type Pagination = {
    data: Order[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    orders: Pagination;
};

const euro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

export default function ClientOrders({ orders }: Props) {
    return (
        <>
            <Head title="Mes commandes — AstreonHeberg" />

            <div className="min-h-screen bg-[#050b18] px-6 py-12 text-white">
                <main className="mx-auto max-w-6xl">
                    <Link
                        href="/client"
                        className="text-sm font-bold text-slate-400"
                    >
                        ← Espace client
                    </Link>

                    <h1 className="mt-6 text-4xl font-black">
                        Mes commandes
                    </h1>

                    <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
                        <div className="divide-y divide-white/10">
                            {orders.data.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/client/orders/${order.id}`}
                                    className="flex flex-col gap-5 px-6 py-6 transition hover:bg-white/[0.03] md:flex-row md:items-center md:justify-between"
                                >
                                    <div>
                                        <p className="text-lg font-black">
                                            {order.reference}
                                        </p>

                                        <p className="mt-2 text-sm text-slate-500">
                                            {order.items_count} article
                                            {order.items_count > 1
                                                ? 's'
                                                : ''}{' '}
                                            ·{' '}
                                            {dateFormatter.format(
                                                new Date(order.created_at),
                                            )}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xl font-black">
                                            {euro.format(
                                                order.total_cents / 100,
                                            )}
                                        </p>

                                        <p className="mt-2 text-sm text-slate-400">
                                            {order.status}
                                        </p>
                                    </div>
                                </Link>
                            ))}

                            {orders.data.length === 0 && (
                                <p className="px-6 py-16 text-center text-slate-500">
                                    Vous n’avez encore aucune commande.
                                </p>
                            )}
                        </div>
                    </section>

                    <div className="mt-6 flex justify-end gap-3">
                        {orders.prev_page_url && (
                            <Link
                                href={orders.prev_page_url}
                                className="rounded-xl border border-white/10 px-4 py-2 font-bold"
                            >
                                Précédent
                            </Link>
                        )}

                        {orders.next_page_url && (
                            <Link
                                href={orders.next_page_url}
                                className="rounded-xl border border-white/10 px-4 py-2 font-bold"
                            >
                                Suivant
                            </Link>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}