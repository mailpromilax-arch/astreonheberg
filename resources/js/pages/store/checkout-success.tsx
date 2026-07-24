import { Head, Link } from '@inertiajs/react';

type OrderItem = {
    id: number;
    product_name: string;
    plan_name: string;
    quantity: number;
    line_total_cents: number;
};

type Order = {
    id: number;
    reference: string;
    status: string;
    total_cents: number;
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

export default function CheckoutSuccess({ order }: Props) {
    return (
        <>
            <Head title="Commande créée — AstreonHeberg" />

            <div className="min-h-screen bg-[#050b18] px-6 py-20 text-white">
                <main className="mx-auto max-w-3xl">
                    <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.06] p-8">
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">
                            Commande enregistrée
                        </p>

                        <h1 className="mt-4 text-4xl font-black">
                            Votre commande est prête
                        </h1>

                        <p className="mt-5 text-slate-300">
                            Référence :{' '}
                            <strong>{order.reference}</strong>
                        </p>

                        <p className="mt-2 text-slate-400">
                            Statut : {order.status}
                        </p>

                        <div className="mt-8 divide-y divide-white/10 rounded-2xl border border-white/10 bg-black/10 px-5">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between gap-5 py-5"
                                >
                                    <span>
                                        {item.product_name} —{' '}
                                        {item.plan_name} ×{' '}
                                        {item.quantity}
                                    </span>

                                    <strong>
                                        {euro.format(
                                            item.line_total_cents / 100,
                                        )}
                                    </strong>
                                </div>
                            ))}
                        </div>

                        <div className="mt-7 flex justify-between border-t border-white/10 pt-6">
                            <span className="font-bold">
                                Total
                            </span>

                            <span className="text-3xl font-black">
                                {euro.format(
                                    order.total_cents / 100,
                                )}
                            </span>
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/boutique"
                                className="rounded-xl border border-white/10 px-5 py-3 text-center font-bold"
                            >
                                Retour à la boutique
                            </Link>

                            <Link
                                href="/client"
                                className="rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-5 py-3 text-center font-black"
                            >
                                Espace client
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}