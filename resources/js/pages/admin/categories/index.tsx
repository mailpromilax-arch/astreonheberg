import { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    sort_order: number;
    is_active: boolean;
    products_count: number;
};

type Pagination = {
    data: Category[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    categories: Pagination;
    filters: {
        search: string;
    };
    statistics: {
        total: number;
        active: number;
        disabled: number;
    };
};

export default function CategoriesIndex({
    categories,
    filters,
    statistics,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        router.get(
            '/admin/categories',
            { search: search || undefined },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const remove = (category: Category): void => {
        if (category.products_count > 0) {
            window.alert(
                'Cette catégorie contient encore des produits.',
            );
            return;
        }

        if (!window.confirm(`Supprimer « ${category.name} » ?`)) {
            return;
        }

        router.delete(`/admin/categories/${category.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Catégories — Administration" />

            <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
                <header className="border-b border-slate-200 bg-[#07101f]">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                        <div>
                            <Link href="/admin" className="text-xl font-black">
                                Astreon
                                <span className="text-emerald-400">
                                    Heberg
                                </span>
                            </Link>
                            <p className="mt-1 text-xs text-slate-500">
                                Administration du catalogue
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href="/admin/products"
                                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"
                            >
                                Produits
                            </Link>

                            <Link
                                href="/admin/categories/create"
                                className="rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-5 py-2 text-sm font-black"
                            >
                                Ajouter une catégorie
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 py-10">
                    <div>
                        <p className="text-sm font-bold text-emerald-400">
                            Catalogue
                        </p>
                        <h1 className="mt-2 text-4xl font-black">
                            Catégories
                        </h1>
                        <p className="mt-3 text-slate-500">
                            Organisez les produits Gaming, VPS et Web.
                        </p>
                    </div>

                    <section className="mt-8 grid gap-4 sm:grid-cols-3">
                        <article className="rounded-2xl border border-slate-200 bg-white p-5">
                            <p className="text-sm text-slate-500">Total</p>
                            <p className="mt-3 text-3xl font-black">
                                {statistics.total}
                            </p>
                        </article>

                        <article className="rounded-2xl border border-slate-200 bg-white p-5">
                            <p className="text-sm text-slate-500">Actives</p>
                            <p className="mt-3 text-3xl font-black text-emerald-300">
                                {statistics.active}
                            </p>
                        </article>

                        <article className="rounded-2xl border border-slate-200 bg-white p-5">
                            <p className="text-sm text-slate-500">
                                Désactivées
                            </p>
                            <p className="mt-3 text-3xl font-black text-amber-300">
                                {statistics.disabled}
                            </p>
                        </article>
                    </section>

                    <form
                        onSubmit={submit}
                        className="mt-8 flex gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                    >
                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Rechercher une catégorie..."
                            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-950 px-4 py-3 outline-none focus:border-blue-400"
                        />

                        <button
                            type="submit"
                            className="rounded-xl bg-blue-500 px-5 py-3 font-black"
                        >
                            Rechercher
                        </button>
                    </form>

                    <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="border-b border-slate-200 bg-white/[0.03]">
                                    <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                                        <th className="px-6 py-4">Catégorie</th>
                                        <th className="px-6 py-4">Produits</th>
                                        <th className="px-6 py-4">Ordre</th>
                                        <th className="px-6 py-4">État</th>
                                        <th className="px-6 py-4 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-white/10">
                                    {categories.data.map((category) => (
                                        <tr key={category.id}>
                                            <td className="px-6 py-5">
                                                <p className="font-black">
                                                    {category.name}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {category.slug}
                                                </p>
                                                <p className="mt-2 max-w-lg text-sm text-slate-500">
                                                    {category.description ??
                                                        'Aucune description'}
                                                </p>
                                            </td>

                                            <td className="px-6 py-5 font-black">
                                                {category.products_count}
                                            </td>

                                            <td className="px-6 py-5">
                                                {category.sort_order}
                                            </td>

                                            <td className="px-6 py-5">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                                                        category.is_active
                                                            ? 'bg-emerald-400/10 text-emerald-300'
                                                            : 'bg-amber-400/10 text-amber-300'
                                                    }`}
                                                >
                                                    {category.is_active
                                                        ? 'Active'
                                                        : 'Désactivée'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/admin/categories/${category.id}/edit`}
                                                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold"
                                                    >
                                                        Modifier
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            remove(category)
                                                        }
                                                        className="rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs font-bold text-red-300"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {categories.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-12 text-center text-slate-500"
                                            >
                                                Aucune catégorie trouvée.
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