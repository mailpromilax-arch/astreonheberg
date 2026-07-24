import { Head, Link } from '@inertiajs/react';

type OrderItem = {
    id: number;
    product_name: string;
    plan_name: string;
    sku: string;
    quantity: number;
    line_total_cents: number;
};

type Order = {
    id: number;
    reference: string;
    status: string;
    total_cents: number;
    billing_name: string;
    billing_email: string;
    billing_address: string;
    billing_postal_code: string;
    billing_city: string;
    billing_country: string;
    created_at: string;
    items: OrderItem[];
};

type Props = {
    order: Order;
};

const euro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

export default function ClientOrderShow({ order }: Props) {
    return (
        <>
            <Head title={`${order.reference} — AstreonHeberg`} />

            <div className="min-h-screen bg-[#050b18] px-6 py-12 text-white">
                <main className="mx-auto max-w-5xl">
                    <Link
                        href="/client/orders"
                        className="text-sm font-bold text-slate-400"
                    >
                        ← Mes commandes
                    </Link>

                    <div className="mt-7">
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">
                            Commande
                        </p>

                        <h1 className="mt-3 text-4xl font-black">
                            {order.reference}
                        </h1>

                        <p className="mt-3 text-slate-400">
                            Statut : {order.status}
                        </p>
                    </div>

                    <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
                        <div className="border-b border-white/10 px-6 py-5">
                            <h2 className="text-xl font-black">
                                Services commandés
                            </h2>
                        </div>

                        <div className="divide-y divide-white/10">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:justify-between"
                                >
                                    <div>
                                        <p className="font-black">
                                            {item.product_name} —{' '}
                                            {item.plan_name}
                                        </p>

                                        <p className="mt-2 text-xs text-slate-500">
                                            {item.sku} · Quantité{' '}
                                            {item.quantity}
                                        </p>
                                    </div>

                                    <p className="text-xl font-black">
                                        {euro.format(
                                            item.line_total_cents / 100,
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="mt-8 grid gap-6 md:grid-cols-2">
                        <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
                            <h2 className="text-xl font-black">
                                Facturation
                            </h2>

                            <address className="mt-5 not-italic leading-7 text-slate-300">
                                {order.billing_name}
                                <br />
                                {order.billing_address}
                                <br />
                                {order.billing_postal_code}{' '}
                                {order.billing_city}
                                <br />
                                {order.billing_country}
                                <br />
                                {order.billing_email}
                            </address>
                        </article>

                        <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
                            <h2 className="text-xl font-black">
                                Total
                            </h2>

                            <p className="mt-6 text-4xl font-black">
                                {euro.format(order.total_cents / 100)}
                            </p>
                        </article>
                    </div>
                </main>
            </div>
        </>
    );
}