import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CreditCard,
    ReceiptText,
    ShoppingCart,
    User,
} from 'lucide-react';
import AdminShell from './admin-shell';

type Value = string | number | boolean | null | undefined;

type Props = {
    payment: Record<string, Value>;
    customer?: Record<string, Value> | null;
    order?: Record<string, Value> | null;
};

const euro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

function text(value: Value): string {
    return value === null || value === undefined || value === ''
        ? '—'
        : String(value);
}

function cents(row: Record<string, Value>): number {
    return Number(
        row.amount_cents
            ?? row.total_cents
            ?? 0,
    );
}

export default function AdminPaymentShow({
    payment,
    customer,
    order,
}: Props) {
    return (
        <AdminShell>
            <Head title={`Paiement ${text(payment.reference ?? payment.id)}`} />

            <Link
                href="/admin/payments"
                className="inline-flex items-center gap-2 text-sm font-black text-violet-300"
            >
                <ArrowLeft className="h-4 w-4" />
                Retour aux paiements
            </Link>

            <section className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[.28em] text-violet-400">
                        Paiement #{text(payment.id)}
                    </p>
                    <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                        {text(payment.reference ?? payment.transaction_id)}
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        {text(payment.provider)} · {text(payment.status)}
                    </p>
                </div>

                <div className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 px-5 py-4">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Montant
                    </p>
                    <p className="mt-2 text-2xl font-black text-violet-200">
                        {euro.format(cents(payment) / 100)}
                    </p>
                </div>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
                <article className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                        <ReceiptText className="h-5 w-5 text-violet-300" />
                        <h2 className="font-black">
                            Détails de la transaction
                        </h2>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {Object.entries(payment).map(([key, value]) => (
                            <div
                                key={key}
                                className="rounded-xl border border-white/5 bg-black/10 p-4"
                            >
                                <p className="text-xs font-black uppercase tracking-wider text-slate-600">
                                    {key}
                                </p>
                                <p className="mt-2 break-all text-sm font-bold text-slate-200">
                                    {text(value)}
                                </p>
                            </div>
                        ))}
                    </div>
                </article>

                <aside className="space-y-6">
                    <article className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-violet-300" />
                            <h2 className="font-black">Client</h2>
                        </div>

                        <p className="mt-4 text-sm font-black">
                            {text(customer?.name)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            {text(customer?.email)}
                        </p>

                        {customer?.id && (
                            <Link
                                href={`/admin/users/${customer.id}`}
                                className="mt-4 inline-flex h-10 items-center rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 text-sm font-black text-violet-200"
                            >
                                Ouvrir le client
                            </Link>
                        )}
                    </article>

                    <article className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="h-5 w-5 text-violet-300" />
                            <h2 className="font-black">Commande liée</h2>
                        </div>

                        <p className="mt-4 text-sm font-black">
                            {text(order?.reference ?? order?.number ?? order?.id)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            {text(order?.status)}
                        </p>

                        {order?.id && (
                            <Link
                                href={`/admin/orders/${order.id}`}
                                className="mt-4 inline-flex h-10 items-center rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 text-sm font-black text-violet-200"
                            >
                                Ouvrir la commande
                            </Link>
                        )}
                    </article>

                    <article className="rounded-2xl border border-cyan-400/15 bg-cyan-500/5 p-5">
                        <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-cyan-300" />
                            <h2 className="font-black text-cyan-100">
                                Données sensibles
                            </h2>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-cyan-100/65">
                            Les numéros complets de carte et codes de sécurité ne
                            sont jamais affichés ni stockés dans cette page.
                        </p>
                    </article>
                </aside>
            </section>
        </AdminShell>
    );
}
