import { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

type Category = {
    id: number;
    name: string;
};

type Product = {
    id: number;
    name: string;
    slug: string;
    short_description: string | null;
    provisioning_driver: string;
    status: string;
    sort_order: number;
    is_featured: boolean;
    plans_count: number;
    category: Category | null;
};

type PaginatedProducts = {
    data: Product[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Filters = {
    search: string;
    category: number | null;
    status: string;
};

type Statistics = {
    total: number;
    active: number;
    draft: number;
    featured: number;
};

type Props = {
    products: PaginatedProducts;
    categories: Category[];
    filters: Filters;
    statistics: Statistics;
};

const navigation = [
    { label: 'Tableau de bord', href: '/admin' },
    { label: 'Clients', href: '#' },
    { label: 'Catégories', href: '/admin/categories' },
    { label: 'Produits', href: '/admin/products' },
    { label: 'Offres', href: '/offres' },
    { label: 'Commandes', href: '#' },
    { label: 'Factures', href: '#' },
    { label: 'Tickets', href: '#' },
    { label: 'Infrastructure', href: '#' },
    { label: 'Journal d’activité', href: '#' },
    { label: 'Paramètres', href: '#' },
];

function statusClass(status: string): string {
    if (status === 'active') {
        return 'bg-emerald-400/10 text-emerald-300';
    }

    if (status === 'draft') {
        return 'bg-amber-400/10 text-amber-300';
    }

    return 'bg-slate-400/10 text-slate-300';
}

export default function ProductsIndex({
    products,
    categories,
    filters,
    statistics,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [category, setCategory] = useState(
        filters.category?.toString() ?? '',
    );
    const [status, setStatus] = useState(filters.status ?? '');

    const submitFilters = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        router.get(
            '/admin/products',
            {
                search: search || undefined,
                category: category || undefined,
                status: status || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetFilters = (): void => {
        setSearch('');
        setCategory('');
        setStatus('');

        router.get(
            '/admin/products',
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const deleteProduct = (product: Product): void => {
        const confirmed = window.confirm(
            `Supprimer définitivement le produit « ${product.name} » et ses offres ?`,
        );

        if (!confirmed) {
            return;
        }

        router.delete(`/admin/products/${product.id}`, {
            preserveScroll: true,
        });
    };

    const cards = [
        { label: 'Total', value: statistics.total },
        { label: 'Actifs', value: statistics.active },
        { label: 'Brouillons', value: statistics.draft },
        { label: 'Mis en avant', value: statistics.featured },
    ];

    return (
        <>
            <Head title="Produits — Administration AstreonHeberg" />

            <div className="min-h-screen bg-[#050b18] text-white">
                <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-[#07101f] lg:block">
                    <div className="flex h-20 items-center border-b border-white/10 px-7">
                        <Link href="/" className="text-xl font-black">
                            Astreon
                            <span className="text-emerald-400">Heberg</span>
                        </Link>
                    </div>

                    <div className="px-4 py-6">
                        <p className="px-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                            Administration
                        </p>

                        <nav className="mt-5 space-y-1">
                            {navigation.map((item) => {
                                const active = item.href === '/admin/products';

                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                            active
                                                ? 'bg-gradient-to-r from-blue-500/20 to-emerald-400/10 text-white'
                                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                <div className="lg:pl-72">
                    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/10 bg-[#050b18]/90 px-6 backdrop-blur-xl lg:px-10">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                                Catalogue
                            </p>
                            <h1 className="mt-1 text-xl font-black">
                                Gestion des produits
                            </h1>
                        </div>

                        <Link
                            href="/admin"
                            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/5"
                        >
                            Tableau de bord
                        </Link>
                    </header>

                    <main className="px-6 py-10 lg:px-10">
                        <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-400">
                                    Produits commercialisés
                                </p>
                                <h2 className="mt-2 text-3xl font-black">
                                    Produits
                                </h2>
                                <p className="mt-3 text-slate-400">
                                    Gérez les services Gaming, VPS et Web proposés
                                    aux clients.
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled
                                title="Disponible lors de la prochaine étape"
                                className="cursor-not-allowed rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-5 py-3 text-sm font-black opacity-60"
                            >
                                Ajouter un produit
                            </button>
                        </section>

                        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {cards.map((card) => (
                                <article
                                    key={card.label}
                                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                                >
                                    <p className="text-sm font-bold text-slate-400">
                                        {card.label}
                                    </p>
                                    <p className="mt-3 text-3xl font-black">
                                        {card.value}
                                    </p>
                                </article>
                            ))}
                        </section>

                        <form
                            onSubmit={submitFilters}
                            className="mt-8 grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 md:grid-cols-[1fr_220px_180px_auto]"
                        >
                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Rechercher un produit..."
                                className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400"
                            />

                            <select
                                value={category}
                                onChange={(event) =>
                                    setCategory(event.target.value)
                                }
                                className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-400"
                            >
                                <option value="">Toutes les catégories</option>

                                {categories.map((item) => (
                                    <option
                                        key={item.id}
                                        value={item.id.toString()}
                                    >
                                        {item.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                                className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-400"
                            >
                                <option value="">Tous les états</option>
                                <option value="active">Actif</option>
                                <option value="draft">Brouillon</option>
                                <option value="disabled">Désactivé</option>
                            </select>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-black hover:bg-blue-400"
                                >
                                    Filtrer
                                </button>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/5"
                                >
                                    Effacer
                                </button>
                            </div>
                        </form>

                        <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="border-b border-white/10 bg-white/[0.03]">
                                        <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                                            <th className="px-6 py-4">
                                                Produit
                                            </th>
                                            <th className="px-6 py-4">
                                                Catégorie
                                            </th>
                                            <th className="px-6 py-4">
                                                Provisionnement
                                            </th>
                                            <th className="px-6 py-4">
                                                Offres
                                            </th>
                                            <th className="px-6 py-4">
                                                État
                                            </th>
                                            <th className="px-6 py-4 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-white/10">
                                        {products.data.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-6 py-14 text-center text-slate-500"
                                                >
                                                    Aucun produit ne correspond
                                                    aux filtres.
                                                </td>
                                            </tr>
                                        )}

                                        {products.data.map((product) => (
                                            <tr
                                                key={product.id}
                                                className="transition hover:bg-white/[0.03]"
                                            >
                                                <td className="px-6 py-5">
                                                    <p className="font-black">
                                                        {product.name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {product.slug}
                                                    </p>
                                                    <p className="mt-2 max-w-sm truncate text-sm text-slate-400">
                                                        {product.short_description ??
                                                            'Aucune description'}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-5 text-sm text-slate-300">
                                                    {product.category?.name ??
                                                        'Sans catégorie'}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs font-bold uppercase text-blue-300">
                                                        {
                                                            product.provisioning_driver
                                                        }
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5 font-black">
                                                    {product.plans_count}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                                                            product.status,
                                                        )}`}
                                                    >
                                                        {product.status}
                                                    </span>

                                                    {product.is_featured && (
                                                        <span className="ml-2 rounded-full bg-purple-400/10 px-3 py-1 text-xs font-bold text-purple-300">
                                                            Mis en avant
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            disabled
                                                            className="cursor-not-allowed rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-slate-400 opacity-50"
                                                        >
                                                            Modifier
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                deleteProduct(
                                                                    product,
                                                                )
                                                            }
                                                            className="rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-400/10"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col gap-4 border-t border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-500">
                                    {products.from ?? 0} à {products.to ?? 0} sur{' '}
                                    {products.total} produits
                                </p>

                                <div className="flex gap-2">
                                    {products.prev_page_url ? (
                                        <Link
                                            href={products.prev_page_url}
                                            preserveScroll
                                            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold hover:bg-white/5"
                                        >
                                            Précédent
                                        </Link>
                                    ) : (
                                        <span className="rounded-xl border border-white/5 px-4 py-2 text-sm text-slate-700">
                                            Précédent
                                        </span>
                                    )}

                                    <span className="rounded-xl bg-white/5 px-4 py-2 text-sm font-bold">
                                        Page {products.current_page} /{' '}
                                        {products.last_page}
                                    </span>

                                    {products.next_page_url ? (
                                        <Link
                                            href={products.next_page_url}
                                            preserveScroll
                                            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold hover:bg-white/5"
                                        >
                                            Suivant
                                        </Link>
                                    ) : (
                                        <span className="rounded-xl border border-white/5 px-4 py-2 text-sm text-slate-700">
                                            Suivant
                                        </span>
                                    )}
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}