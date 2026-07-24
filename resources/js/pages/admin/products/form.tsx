import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

type Category = {
    id: number;
    name: string;
};

type Product = {
    id: number;
    product_category_id: number;
    name: string;
    slug: string;
    short_description: string | null;
    description: string | null;
    provisioning_driver: string;
    status: string;
    sort_order: number;
    is_featured: boolean;
};

type Props = {
    product: Product | null;
    categories: Category[];
    drivers: Record<string, string>;
    statuses: Record<string, string>;
};

export default function ProductForm({
    product,
    categories,
    drivers,
    statuses,
}: Props) {
    const editing = product !== null;

    const form = useForm({
        product_category_id:
            product?.product_category_id ??
            categories[0]?.id ??
            0,
        name: product?.name ?? '',
        slug: product?.slug ?? '',
        short_description: product?.short_description ?? '',
        description: product?.description ?? '',
        provisioning_driver:
            product?.provisioning_driver ?? 'manual',
        status: product?.status ?? 'draft',
        sort_order: product?.sort_order ?? 0,
        is_featured: product?.is_featured ?? false,
    });

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (editing) {
            form.put(`/admin/products/${product.id}`);
            return;
        }

        form.post('/admin/products');
    };

    return (
        <>
            <Head
                title={
                    editing
                        ? 'Modifier le produit — AstreonHeberg'
                        : 'Ajouter un produit — AstreonHeberg'
                }
            />

            <div className="min-h-screen bg-[#050b18] px-6 py-12 text-white">
                <main className="mx-auto max-w-4xl">
                    <Link
                        href="/admin/products"
                        className="text-sm font-bold text-slate-400 transition hover:text-white"
                    >
                        ← Retour aux produits
                    </Link>

                    <div className="mt-6">
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">
                            Catalogue
                        </p>

                        <h1 className="mt-3 text-4xl font-black">
                            {editing
                                ? 'Modifier le produit'
                                : 'Ajouter un produit'}
                        </h1>

                        <p className="mt-3 text-slate-400">
                            Configurez les informations commerciales et le
                            système de provisionnement du service.
                        </p>
                    </div>

                    <form
                        onSubmit={submit}
                        className="mt-9 space-y-8 rounded-3xl border border-white/10 bg-white/[0.04] p-7"
                    >
                        <section className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-bold">
                                    Nom du produit
                                </label>

                                <input
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Minecraft Java"
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none transition focus:border-blue-400"
                                />

                                {form.errors.name && (
                                    <p className="mt-2 text-sm text-red-300">
                                        {form.errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-bold">
                                    Catégorie
                                </label>

                                <select
                                    value={form.data.product_category_id}
                                    onChange={(event) =>
                                        form.setData(
                                            'product_category_id',
                                            Number(event.target.value),
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none transition focus:border-blue-400"
                                >
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>

                                {form.errors.product_category_id && (
                                    <p className="mt-2 text-sm text-red-300">
                                        {form.errors.product_category_id}
                                    </p>
                                )}
                            </div>
                        </section>

                        <div>
                            <label className="text-sm font-bold">
                                Slug
                            </label>

                            <input
                                value={form.data.slug}
                                onChange={(event) =>
                                    form.setData(
                                        'slug',
                                        event.target.value,
                                    )
                                }
                                placeholder="Généré automatiquement si vide"
                                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none transition focus:border-blue-400"
                            />

                            <p className="mt-2 text-xs text-slate-500">
                                Utilisé dans les URL et les intégrations.
                            </p>

                            {form.errors.slug && (
                                <p className="mt-2 text-sm text-red-300">
                                    {form.errors.slug}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-bold">
                                Description courte
                            </label>

                            <textarea
                                rows={3}
                                value={form.data.short_description}
                                onChange={(event) =>
                                    form.setData(
                                        'short_description',
                                        event.target.value,
                                    )
                                }
                                placeholder="Résumé affiché dans les cartes et listes."
                                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none transition focus:border-blue-400"
                            />

                            {form.errors.short_description && (
                                <p className="mt-2 text-sm text-red-300">
                                    {form.errors.short_description}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-bold">
                                Description complète
                            </label>

                            <textarea
                                rows={8}
                                value={form.data.description}
                                onChange={(event) =>
                                    form.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                                placeholder="Présentation complète du produit..."
                                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none transition focus:border-blue-400"
                            />

                            {form.errors.description && (
                                <p className="mt-2 text-sm text-red-300">
                                    {form.errors.description}
                                </p>
                            )}
                        </div>

                        <section className="grid gap-6 md:grid-cols-3">
                            <div>
                                <label className="text-sm font-bold">
                                    Provisionnement
                                </label>

                                <select
                                    value={form.data.provisioning_driver}
                                    onChange={(event) =>
                                        form.setData(
                                            'provisioning_driver',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none transition focus:border-blue-400"
                                >
                                    {Object.entries(drivers).map(
                                        ([value, label]) => (
                                            <option
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </option>
                                        ),
                                    )}
                                </select>

                                {form.errors.provisioning_driver && (
                                    <p className="mt-2 text-sm text-red-300">
                                        {form.errors.provisioning_driver}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-bold">
                                    État
                                </label>

                                <select
                                    value={form.data.status}
                                    onChange={(event) =>
                                        form.setData(
                                            'status',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none transition focus:border-blue-400"
                                >
                                    {Object.entries(statuses).map(
                                        ([value, label]) => (
                                            <option
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </option>
                                        ),
                                    )}
                                </select>

                                {form.errors.status && (
                                    <p className="mt-2 text-sm text-red-300">
                                        {form.errors.status}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-bold">
                                    Ordre d’affichage
                                </label>

                                <input
                                    type="number"
                                    min={0}
                                    max={9999}
                                    value={form.data.sort_order}
                                    onChange={(event) =>
                                        form.setData(
                                            'sort_order',
                                            Number(event.target.value),
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none transition focus:border-blue-400"
                                />

                                {form.errors.sort_order && (
                                    <p className="mt-2 text-sm text-red-300">
                                        {form.errors.sort_order}
                                    </p>
                                )}
                            </div>
                        </section>

                        <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                            <input
                                type="checkbox"
                                checked={form.data.is_featured}
                                onChange={(event) =>
                                    form.setData(
                                        'is_featured',
                                        event.target.checked,
                                    )
                                }
                                className="mt-1 h-4 w-4"
                            />

                            <span>
                                <span className="block font-black">
                                    Mettre le produit en avant
                                </span>

                                <span className="mt-1 block text-sm text-slate-400">
                                    Le produit pourra apparaître sur la page
                                    d’accueil et dans les recommandations.
                                </span>
                            </span>
                        </label>

                        <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-7 sm:flex-row sm:justify-end">
                            <Link
                                href="/admin/products"
                                className="rounded-xl border border-white/10 px-6 py-3 text-center font-bold transition hover:bg-white/5"
                            >
                                Annuler
                            </Link>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-7 py-3 font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {form.processing
                                    ? 'Enregistrement...'
                                    : editing
                                      ? 'Enregistrer les modifications'
                                      : 'Créer le produit'}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </>
    );
}