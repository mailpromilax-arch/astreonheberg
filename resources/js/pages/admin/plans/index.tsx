import { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

type Product = {
    id: number;
    name: string;
    slug: string;
};

type Plan = {
    id: number;
    name: string;
    slug: string;
    sku: string;
    price_monthly_cents: number;
    ram_mb: number | null;
    disk_gb: number | null;
    cpu_percent: number | null;
    cpu_cores: number | null;
    status: string;
    is_popular: boolean;
    stock_tracking: boolean;
    stock_quantity: number | null;
    product: Product | null;
};

type Pagination = {
    data: Plan[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    plans: Pagination;
    products: Product[];
    filters: {
        search: string;
        product: number | null;
        status: string;
    };
    statistics: {
        total: number;
        active: number;
        popular: number;
        trackedStock: number;
    };
};

const priceFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

export default function PlansIndex({
    plans,
    products,
    filters,
    statistics,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [product, setProduct] = useState(
        filters.product?.toString() ?? '',
    );
    const [status, setStatus] = useState(filters.status ?? '');

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        router.get(
            '/admin/plans',
            {
                search: search || undefined,
                product: product || undefined,
                status: status || undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const remove = (plan: Plan): void => {
        if (!window.confirm(`Supprimer l’offre « ${plan.name} » ?`)) {
            return;
        }

        router.delete(`/admin/plans/${plan.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Offres — Administration AstreonHeberg" />

            <div className="min-h-screen bg-[#050b18] px-6 py-10 text-white">
                <main className="mx-auto max-w-7xl">
                    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div>
                            <Link
                                href="/admin"
                                className="text-sm font-bold text-slate-400 hover:text-white"
                            >
                                ← Administration
                            </Link>

                            <p className="mt-6 text-sm font-black uppercase tracking-[0.2em] text-emerald-400">
                                Catalogue
                            </p>

                            <h1 className="mt-3 text-4xl font-black">
                                Offres tarifaires
                            </h1>

                            <p className="mt-3 text-slate-400">
                                Gérez les prix et ressources des services.
                            </p>
                        </div>

                        <Link
                            href="/admin/plans/create"
                            className="rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-5 py-3 text-sm font-black"
                        >
                            Ajouter une offre
                        </Link>
                    </div>

                    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {[
                            ['Total', statistics.total],
                            ['Actives', statistics.active],
                            ['Populaires', statistics.popular],
                            ['Stock suivi', statistics.trackedStock],
                        ].map(([label, value]) => (
                            <article
                                key={label}
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

                    <form
                        onSubmit={submit}
                        className="mt-8 grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 md:grid-cols-[1fr_240px_180px_auto]"
                    >
                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Nom, slug ou SKU..."
                            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none"
                        />

                        <select
                            value={product}
                            onChange={(event) =>
                                setProduct(event.target.value)
                            }
                            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
                        >
                            <option value="">Tous les produits</option>

                            {products.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value)
                            }
                            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
                        >
                            <option value="">Tous les états</option>
                            <option value="active">Actif</option>
                            <option value="draft">Brouillon</option>
                            <option value="disabled">Désactivé</option>
                        </select>

                        <button
                            type="submit"
                            className="rounded-xl bg-blue-500 px-5 py-3 font-black"
                        >
                            Filtrer
                        </button>
                    </form>

                    <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="border-b border-white/10">
                                    <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                                        <th className="px-6 py-4">Offre</th>
                                        <th className="px-6 py-4">Produit</th>
                                        <th className="px-6 py-4">Prix</th>
                                        <th className="px-6 py-4">Ressources</th>
                                        <th className="px-6 py-4">État</th>
                                        <th className="px-6 py-4 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-white/10">
                                    {plans.data.map((plan) => (
                                        <tr key={plan.id}>
                                            <td className="px-6 py-5">
                                                <p className="font-black">
                                                    {plan.name}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {plan.sku}
                                                </p>

                                                {plan.is_popular && (
                                                    <span className="mt-2 inline-flex rounded-full bg-purple-400/10 px-3 py-1 text-xs font-bold text-purple-300">
                                                        Populaire
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-5">
                                                {plan.product?.name ?? '—'}
                                            </td>

                                            <td className="px-6 py-5 font-black">
                                                {priceFormatter.format(
                                                    plan.price_monthly_cents /
                                                        100,
                                                )}
                                            </td>

                                            <td className="px-6 py-5 text-sm text-slate-300">
                                                <p>
                                                    RAM :{' '}
                                                    {plan.ram_mb
                                                        ? `${plan.ram_mb / 1024} Go`
                                                        : '—'}
                                                </p>
                                                <p>
                                                    Disque :{' '}
                                                    {plan.disk_gb
                                                        ? `${plan.disk_gb} Go`
                                                        : '—'}
                                                </p>
                                                <p>
                                                    CPU :{' '}
                                                    {plan.cpu_cores
                                                        ? `${plan.cpu_cores} vCPU`
                                                        : plan.cpu_percent
                                                          ? `${plan.cpu_percent} %`
                                                          : '—'}
                                                </p>
                                            </td>

                                            <td className="px-6 py-5">
                                                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                                                    {plan.status}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/admin/plans/${plan.id}/edit`}
                                                        className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold"
                                                    >
                                                        Modifier
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            remove(plan)
                                                        }
                                                        className="rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs font-bold text-red-300"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {plans.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-14 text-center text-slate-500"
                                            >
                                                Aucune offre trouvée.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}