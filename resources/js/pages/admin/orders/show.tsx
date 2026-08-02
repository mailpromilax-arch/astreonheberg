import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

type OrderItem = {
    id: number;
    product_name: string;
    plan_name: string;
    sku: string;
    quantity: number;
    billing_cycle: string;
    unit_price_cents: number;
    setup_fee_cents: number;
    line_subtotal_cents: number;
    line_setup_cents: number;
    line_total_cents: number;
};

type Order = {
    id: number;
    reference: string;
    status: string;
    currency: string;
    subtotal_cents: number;
    setup_total_cents: number;
    tax_total_cents: number;
    total_cents: number;
    billing_name: string;
    billing_email: string;
    billing_company: string | null;
    billing_address: string;
    billing_postal_code: string;
    billing_city: string;
    billing_country: string;
    payment_provider: string | null;
    payment_reference: string | null;
    paid_at: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        company_name: string | null;
        status: string;
    } | null;
    items: OrderItem[];
};

type Props = {
    order: Order;
    statuses: Record<string, string>;
};

const euro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
});

export default function OrderShow({
    order,
    statuses,
}: Props) {
    const form = useForm({
        status: order.status,
    });

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        form.patch(`/admin/orders/${order.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`${order.reference} — Administration`} />

            <div className="min-h-screen bg-[#f5f7fb] px-6 py-10 text-slate-950">
                <main className="mx-auto max-w-7xl">
                    <Link
                        href="/admin/orders"
                        className="text-sm font-bold text-slate-500 hover:text-slate-950"
                    >
                        ← Retour aux commandes
                    </Link>

                    <div className="mt-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">
                                Commande
                            </p>

                            <h1 className="mt-3 text-4xl font-black">
                                {order.reference}
                            </h1>

                            <p className="mt-3 text-slate-500">
                                Créée le{' '}
                                {dateFormatter.format(
                                    new Date(order.created_at),
                                )}
                            </p>
                        </div>

                        <form
                            onSubmit={submit}
                            className="flex flex-col gap-3 sm:flex-row"
                        >
                            <select
                                value={form.data.status}
                                onChange={(event) =>
                                    form.setData(
                                        'status',
                                        event.target.value,
                                    )
                                }
                                className="rounded-xl border border-slate-200 bg-slate-950 px-4 py-3"
                            >
                                {Object.entries(statuses).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-5 py-3 font-black disabled:opacity-50"
                            >
                                Mettre à jour
                            </button>
                        </form>
                    </div>

                    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
                        <section className="space-y-8">
                            <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                                <div className="border-b border-slate-200 px-6 py-5">
                                    <h2 className="text-xl font-black">
                                        Services commandés
                                    </h2>
                                </div>

                                <div className="divide-y divide-white/10">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="px-6 py-6"
                                        >
                                            <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
                                                <div>
                                                    <p className="text-lg font-black">
                                                        {item.product_name} —{' '}
                                                        {item.plan_name}
                                                    </p>

                                                    <p className="mt-2 text-xs text-slate-500">
                                                        {item.sku} ·{' '}
                                                        {item.billing_cycle} ·
                                                        Quantité {item.quantity}
                                                    </p>
                                                </div>

                                                <p className="text-xl font-black">
                                                    {euro.format(
                                                        item.line_total_cents /
                                                            100,
                                                    )}
                                                </p>
                                            </div>

                                            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                                                <div>
                                                    <dt className="text-slate-500">
                                                        Prix unitaire
                                                    </dt>
                                                    <dd className="mt-1 font-bold">
                                                        {euro.format(
                                                            item.unit_price_cents /
                                                                100,
                                                        )}
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-slate-500">
                                                        Mise en service
                                                    </dt>
                                                    <dd className="mt-1 font-bold">
                                                        {euro.format(
                                                            item.line_setup_cents /
                                                                100,
                                                        )}
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-slate-500">
                                                        Sous-total
                                                    </dt>
                                                    <dd className="mt-1 font-bold">
                                                        {euro.format(
                                                            item.line_subtotal_cents /
                                                                100,
                                                        )}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>
                                    ))}
                                </div>
                            </article>

                            <article className="rounded-3xl border border-slate-200 bg-white p-7">
                                <h2 className="text-xl font-black">
                                    Facturation
                                </h2>

                                <address className="mt-6 not-italic leading-7 text-slate-300">
                                    <strong>{order.billing_name}</strong>
                                    <br />

                                    {order.billing_company && (
                                        <>
                                            {order.billing_company}
                                            <br />
                                        </>
                                    )}

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
                        </section>

                        <aside className="space-y-6">
                            <article className="rounded-3xl border border-slate-200 bg-white p-7">
                                <h2 className="text-xl font-black">
                                    Récapitulatif
                                </h2>

                                <dl className="mt-6 space-y-4">
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-slate-500">
                                            Abonnements
                                        </dt>
                                        <dd className="font-bold">
                                            {euro.format(
                                                order.subtotal_cents / 100,
                                            )}
                                        </dd>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <dt className="text-slate-500">
                                            Installation
                                        </dt>
                                        <dd className="font-bold">
                                            {euro.format(
                                                order.setup_total_cents / 100,
                                            )}
                                        </dd>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <dt className="text-slate-500">
                                            TVA
                                        </dt>
                                        <dd className="font-bold">
                                            {euro.format(
                                                order.tax_total_cents / 100,
                                            )}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="mt-6 flex items-end justify-between border-t border-slate-200 pt-6">
                                    <span className="font-bold">
                                        Total
                                    </span>

                                    <span className="text-3xl font-black">
                                        {euro.format(
                                            order.total_cents / 100,
                                        )}
                                    </span>
                                </div>
                            </article>

                            <article className="rounded-3xl border border-slate-200 bg-white p-7">
                                <h2 className="text-xl font-black">
                                    Client
                                </h2>

                                <p className="mt-5 font-black">
                                    {order.user?.name ??
                                        order.billing_name}
                                </p>

                                <p className="mt-2 text-sm text-slate-500">
                                    {order.user?.email ??
                                        order.billing_email}
                                </p>

                                {order.user?.company_name && (
                                    <p className="mt-2 text-sm text-slate-500">
                                        {order.user.company_name}
                                    </p>
                                )}
                            </article>

                            <article className="rounded-3xl border border-slate-200 bg-white p-7">
                                <h2 className="text-xl font-black">
                                    Paiement
                                </h2>

                                <dl className="mt-5 space-y-4 text-sm">
                                    <div>
                                        <dt className="text-slate-500">
                                            Prestataire
                                        </dt>
                                        <dd className="mt-1 font-bold">
                                            {order.payment_provider ?? '—'}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="text-slate-500">
                                            Référence
                                        </dt>
                                        <dd className="mt-1 break-all font-bold">
                                            {order.payment_reference ?? '—'}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="text-slate-500">
                                            Date de paiement
                                        </dt>
                                        <dd className="mt-1 font-bold">
                                            {order.paid_at
                                                ? dateFormatter.format(
                                                      new Date(order.paid_at),
                                                  )
                                                : 'Non payée'}
                                        </dd>
                                    </div>
                                </dl>
                            </article>
                        </aside>
                    </div>
                </main>
            </div>
        </>
    );
}