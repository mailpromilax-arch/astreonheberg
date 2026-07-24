import { Head, Link } from '@inertiajs/react';

type Order = {
    id: number;
    reference: string;
    status: string;
    total_cents: number;
    created_at: string;
    items_count: number;
};

type Props = {
    statistics: {
        orders: number;
        pending: number;
        active: number;
        paid_cents: number;
    };
    latestOrders: Order[];
};

const euro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
});

export default function ClientDashboard({
    statistics,
    latestOrders,
}: Props) {
    return (
        <>
            <Head title="Espace client — AstreonHeberg" />

            <div className="min-h-screen bg-[#050b18] text-white">
                <header className="border-b border-white/10 bg-[#07101f]">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                        <Link href="/" className="text-xl font-black">
                            Astreon
                            <span className="text-emerald-400">
                                Heberg
                            </span>
                        </Link>

                        <div className="flex gap-3">
                            <Link
                                href="/boutique"
                                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold"
                            >
                                Boutique
                            </Link>

                            <Link
                                href="/client/orders"
                                className="rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-4 py-2 text-sm font-black"
                            >
                                Mes commandes
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 py-12">
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">
                        Espace client
                    </p>

                    <h1 className="mt-3 text-4xl font-black">
                        Tableau de bord
                    </h1>

                    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {[
                            ['Commandes', statistics.orders],
                            ['En attente', statistics.pending],
                            ['Services actifs', statistics.active],
                            [
                                'Total payé',
                                euro.format(statistics.paid_cents / 100),
                            ],
                        ].map(([label, value]) => (
                            <article
                                key={String(label)}
                                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                            >
                                <p className="text-sm text-slate-400">
                                    {label}
                                </p>

                                <p className="mt-3 text-3xl font-black">
                                    {value}
                                </p>
                            </article>
                        ))}
                    </section>

                    <section className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                            <h2 className="text-xl font-black">
                                Dernières commandes
                            </h2>

                            <Link
                                href="/client/orders"
                                className="text-sm font-bold text-emerald-400"
                            >
                                Tout voir
                            </Link>
                        </div>

                        <div className="divide-y divide-white/10">
                            {latestOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/client/orders/${order.id}`}
                                    className="flex flex-col gap-3 px-6 py-5 transition hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <p className="font-black">
                                            {order.reference}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
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
                                        <p className="font-black">
                                            {euro.format(
                                                order.total_cents / 100,
                                            )}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            {order.status}
                                        </p>
                                    </div>
                                </Link>
                            ))}

                            {latestOrders.length === 0 && (
                                <p className="px-6 py-12 text-center text-slate-500">
                                    Aucune commande pour le moment.
                                </p>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}