import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    sort_order: number;
    is_active: boolean;
};

type Props = {
    category: Category | null;
};

export default function CategoryForm({ category }: Props) {
    const editing = category !== null;

    const form = useForm({
        name: category?.name ?? '',
        slug: category?.slug ?? '',
        description: category?.description ?? '',
        icon: category?.icon ?? '',
        sort_order: category?.sort_order ?? 0,
        is_active: category?.is_active ?? true,
    });

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (editing) {
            form.put(`/admin/categories/${category.id}`);
            return;
        }

        form.post('/admin/categories');
    };

    return (
        <>
            <Head
                title={
                    editing
                        ? 'Modifier la catégorie'
                        : 'Ajouter une catégorie'
                }
            />

            <div className="min-h-screen bg-[#f5f7fb] px-6 py-12 text-slate-950">
                <main className="mx-auto max-w-3xl">
                    <Link
                        href="/admin/categories"
                        className="text-sm font-bold text-slate-500 hover:text-slate-950"
                    >
                        ← Retour aux catégories
                    </Link>

                    <h1 className="mt-6 text-4xl font-black">
                        {editing
                            ? 'Modifier la catégorie'
                            : 'Ajouter une catégorie'}
                    </h1>

                    <form
                        onSubmit={submit}
                        className="mt-8 space-y-6 rounded-3xl border border-slate-200 bg-white p-7"
                    >
                        <div>
                            <label className="text-sm font-bold">Nom</label>
                            <input
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-950 px-4 py-3 outline-none focus:border-blue-400"
                            />
                            {form.errors.name && (
                                <p className="mt-2 text-sm text-red-300">
                                    {form.errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-bold">
                                Slug
                            </label>
                            <input
                                value={form.data.slug}
                                onChange={(event) =>
                                    form.setData('slug', event.target.value)
                                }
                                placeholder="Généré automatiquement si vide"
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-950 px-4 py-3 outline-none focus:border-blue-400"
                            />
                            {form.errors.slug && (
                                <p className="mt-2 text-sm text-red-300">
                                    {form.errors.slug}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-bold">
                                Description
                            </label>
                            <textarea
                                rows={5}
                                value={form.data.description}
                                onChange={(event) =>
                                    form.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-950 px-4 py-3 outline-none focus:border-blue-400"
                            />
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-bold">
                                    Icône
                                </label>
                                <input
                                    value={form.data.icon}
                                    onChange={(event) =>
                                        form.setData(
                                            'icon',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="gamepad, server, globe..."
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-950 px-4 py-3 outline-none focus:border-blue-400"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold">
                                    Ordre
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.data.sort_order}
                                    onChange={(event) =>
                                        form.setData(
                                            'sort_order',
                                            Number(event.target.value),
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-950 px-4 py-3 outline-none focus:border-blue-400"
                                />
                            </div>
                        </div>

                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(event) =>
                                    form.setData(
                                        'is_active',
                                        event.target.checked,
                                    )
                                }
                            />
                            <span className="font-bold">
                                Catégorie active
                            </span>
                        </label>

                        <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
                            <Link
                                href="/admin/categories"
                                className="rounded-xl border border-slate-200 px-5 py-3 font-bold"
                            >
                                Annuler
                            </Link>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-6 py-3 font-black disabled:opacity-50"
                            >
                                {form.processing
                                    ? 'Enregistrement...'
                                    : editing
                                      ? 'Enregistrer'
                                      : 'Créer la catégorie'}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </>
    );
}