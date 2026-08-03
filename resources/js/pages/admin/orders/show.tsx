import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CreditCard,
    PackageCheck,
    Save,
    Server,
    ShoppingCart,
    User,
} from 'lucide-react';
import { FormEvent } from 'react';
import AdminShell from './admin-shell';

type Value = string | number | boolean | null | undefined;

type Props = {
    order: Record<string, Value>;
    customer?: Record<string, Value> | null;
    items: Array<Record<string, Value>>;
    services: Array<Record<string, Value>>;
    payments: Array<Record<string, Value>>;
};

type SharedProps = {
    flash?: {
        success?: string;
    };
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
        row.total_cents
            ?? row.amount_cents
            ?? row.price_cents
            ?? row.unit_price_cents
            ?? 0,
    );
}

export default function AdminOrderShow({
    order,
    customer,
    items,
    services,
    payments,
}: Props) {
    const flash = usePage<SharedProps>().props.flash;

    const form = useForm({
        status: text(order.status) === '—'
            ? 'pending'
            : text(order.status),
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.patch(`/admin/orders/${order.id}`);
    }

    return (
        <AdminShell>
            <Head title={`Commande ${text(order.reference ?? order.id)}`} />

            <Link
                href="/admin/orders"
                className="inline-flex items-center gap-2 text-sm font-black text-violet-300"
            >
                <ArrowLeft className="h-4 w-4" />
                Retour aux commandes
            </Link>

            <section className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[.28em] text-violet-400">
                        Commande #{text(order.id)}
                    </p>
                    <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                        {text(order.reference ?? order.number ?? order.id)}
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Statut actuel : {text(order.status)}
                    </p>
                </div>

                <div className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 px-5 py-4">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Montant total
                    </p>
                    <p className="mt-2 text-2xl font-black text-violet-200">
                        {euro.format(cents(order) / 100)}
                    </p>
                </div>
            </section>

            {flash?.success && (
                <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                    {flash.success}
                </div>
            )}

            <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
                <div className="space-y-6">
                    <article className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="h-5 w-5 text-violet-300" />
                            <h2 className="font-black">Articles commandés</h2>
                        </div>

                        <div className="mt-4 space-y-3">
                            {items.length === 0 && (
                                <p className="py-8 text-center text-sm text-slate-500">
                                    Aucun article enregistré.
                                </p>
                            )}

                            {items.map((item) => (
                                <div
                                    key={String(item.id)}
                                    className="flex items-start justify-between gap-4 rounded-xl border border-white/5 bg-black/10 p-4"
                                >
                                    <div>
                                        <p className="text-sm font-black">
                                            {text(
                                                item.name
                                                    ?? item.product_name
                                                    ?? item.description
                                                    ?? `Article #${text(item.id)}`,
                                            )}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Quantité : {text(item.quantity ?? 1)}
                                        </p>
                                    </div>

                                    <p className="text-sm font-black text-violet-200">
                                        {euro.format(cents(item) / 100)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </article>

                    <article className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5">
                        <div className="flex items-center gap-3">
                            <Server className="h-5 w-5 text-violet-300" />
                            <h2 className="font-black">Services livrés</h2>
                        </div>

                        <div className="mt-4 space-y-3">
                            {services.length === 0 && (
                                <p className="py-8 text-center text-sm text-slate-500">
                                    Aucun service lié.
                                </p>
                            )}

                            {services.map((service) => (
                                <Link
                                    key={String(service.id)}
                                    href={`/admin/servers/${service.id}`}
                                    className="block rounded-xl border border-white/5 bg-black/10 p-4 hover:border-violet-400/20"
                                >
                                    <p className="text-sm font-black">
                                        {text(service.name ?? service.reference)}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {text(service.status)}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </article>

                    <article className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5">
                        <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-violet-300" />
                            <h2 className="font-black">Paiements liés</h2>
                        </div>

                        <div className="mt-4 space-y-3">
                            {payments.length === 0 && (
                                <p className="py-8 text-center text-sm text-slate-500">
                                    Aucun paiement lié.
                                </p>
                            )}

                            {payments.map((payment) => (
                                <div
                                    key={String(payment.id)}
                                    className="flex items-start justify-between gap-4 rounded-xl border border-white/5 bg-black/10 p-4"
                                >
                                    <div>
                                        <p className="text-sm font-black">
                                            Paiement #{text(payment.id)}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {text(payment.status)}
                                        </p>
                                    </div>

                                    <p className="text-sm font-black text-violet-200">
                                        {euro.format(cents(payment) / 100)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </article>
                </div>

                <aside className="space-y-6">
                    <form
                        onSubmit={submit}
                        className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5"
                    >
                        <div className="flex items-center gap-3">
                            <PackageCheck className="h-5 w-5 text-violet-300" />
                            <h2 className="font-black">Gestion du statut</h2>
                        </div>

                        <select
                            value={form.data.status}
                            onChange={(event) =>
                                form.setData('status', event.target.value)
                            }
                            className="mt-4 h-12 w-full rounded-xl border border-violet-400/15 bg-[#0c0917] px-4 text-sm text-white outline-none"
                        >
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
                            disabled={form.processing}
                            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-black disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            Enregistrer
                        </button>
                    </form>

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
                        <h2 className="font-black">Détails techniques</h2>

                        <div className="mt-4 max-h-[580px] space-y-2 overflow-y-auto">
                            {Object.entries(order).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="flex items-start justify-between gap-4 rounded-xl border border-white/5 bg-black/10 p-3"
                                >
                                    <span className="text-xs font-black uppercase text-slate-600">
                                        {key}
                                    </span>
                                    <span className="max-w-[60%] break-all text-right text-xs text-slate-300">
                                        {text(value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </article>
                </aside>
            </section>
        </AdminShell>
    );
}
