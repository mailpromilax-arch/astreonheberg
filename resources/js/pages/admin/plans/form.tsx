import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

type Product = {
    id: number;
    name: string;
    slug: string;
};

type Plan = {
    id: number;
    product_id: number;
    name: string;
    slug: string;
    sku: string;
    price_monthly: number;
    setup_fee: number;
    ram_mb: number | null;
    disk_gb: number | null;
    cpu_percent: number | null;
    cpu_cores: number | null;
    databases_limit: number | null;
    backups_limit: number | null;
    player_slots: number | null;
    features_text: string;
    stock_quantity: number | null;
    stock_tracking: boolean;
    allow_upgrades: boolean;
    allow_downgrades: boolean;
    status: string;
    is_popular: boolean;
    sort_order: number;
};

type Props = {
    plan: Plan | null;
    products: Product[];
    selectedProductId: number | null;
    statuses: Record<string, string>;
};

export default function PlanForm({
    plan,
    products,
    selectedProductId,
    statuses,
}: Props) {
    const editing = plan !== null;

    const form = useForm({
        product_id:
            plan?.product_id ??
            selectedProductId ??
            products[0]?.id ??
            0,
        name: plan?.name ?? '',
        slug: plan?.slug ?? '',
        sku: plan?.sku ?? '',
        price_monthly: plan?.price_monthly ?? 0,
        setup_fee: plan?.setup_fee ?? 0,
        ram_mb: plan?.ram_mb ?? null,
        disk_gb: plan?.disk_gb ?? null,
        cpu_percent: plan?.cpu_percent ?? null,
        cpu_cores: plan?.cpu_cores ?? null,
        databases_limit: plan?.databases_limit ?? null,
        backups_limit: plan?.backups_limit ?? null,
        player_slots: plan?.player_slots ?? null,
        features_text: plan?.features_text ?? '',
        stock_quantity: plan?.stock_quantity ?? null,
        stock_tracking: plan?.stock_tracking ?? false,
        allow_upgrades: plan?.allow_upgrades ?? true,
        allow_downgrades: plan?.allow_downgrades ?? true,
        status: plan?.status ?? 'draft',
        is_popular: plan?.is_popular ?? false,
        sort_order: plan?.sort_order ?? 0,
    });

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (editing) {
            form.put(`/admin/plans/${plan.id}`);
            return;
        }

        form.post('/admin/plans');
    };

    const numberValue = (
        value: string,
    ): number | null => {
        return value === '' ? null : Number(value);
    };

    return (
        <>
            <Head
                title={
                    editing
                        ? 'Modifier l’offre'
                        : 'Ajouter une offre'
                }
            />

            <div className="min-h-screen bg-[#050b18] px-6 py-12 text-white">
                <main className="mx-auto max-w-5xl">
                    <Link
                        href="/admin/plans"
                        className="text-sm font-bold text-slate-400 hover:text-white"
                    >
                        ← Retour aux offres
                    </Link>

                    <h1 className="mt-6 text-4xl font-black">
                        {editing
                            ? 'Modifier l’offre'
                            : 'Ajouter une offre'}
                    </h1>

                    <form
                        onSubmit={submit}
                        className="mt-8 space-y-8 rounded-3xl border border-white/10 bg-white/[0.04] p-7"
                    >
                        <section className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-bold">
                                    Produit
                                </label>

                                <select
                                    value={form.data.product_id}
                                    onChange={(event) =>
                                        form.setData(
                                            'product_id',
                                            Number(event.target.value),
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
                                >
                                    {products.map((product) => (
                                        <option
                                            key={product.id}
                                            value={product.id}
                                        >
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-bold">
                                    Nom
                                </label>

                                <input
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
                                />
                            </div>

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
                                    placeholder="Automatique si vide"
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold">
                                    SKU
                                </label>

                                <input
                                    value={form.data.sku}
                                    onChange={(event) =>
                                        form.setData(
                                            'sku',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="GAME-MCJ-START"
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
                                />
                            </div>
                        </section>

                        <section className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-bold">
                                    Prix mensuel (€)
                                </label>

                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={form.data.price_monthly}
                                    onChange={(event) =>
                                        form.setData(
                                            'price_monthly',
                                            Number(event.target.value),
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold">
                                    Frais d’installation (€)
                                </label>

                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={form.data.setup_fee}
                                    onChange={(event) =>
                                        form.setData(
                                            'setup_fee',
                                            Number(event.target.value),
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
                                />
                            </div>
                        </section>

                        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                ['ram_mb', 'RAM (Mo)'],
                                ['disk_gb', 'Disque (Go)'],
                                ['cpu_percent', 'CPU (%)'],
                                ['cpu_cores', 'vCPU'],
                                ['databases_limit', 'Bases SQL'],
                                ['backups_limit', 'Sauvegardes'],
                                ['player_slots', 'Joueurs'],
                                ['stock_quantity', 'Stock'],
                            ].map(([field, label]) => (
                                <div key={field}>
                                    <label className="text-sm font-bold">
                                        {label}
                                    </label>

                                    <input
                                        type="number"
                                        min={0}
                                        value={
                                            form.data[
                                                field as keyof typeof form.data
                                            ] as number | ''
                                                ?? ''
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                field as keyof typeof form.data,
                                                numberValue(
                                                    event.target.value,
                                                ) as never,
                                            )
                                        }
                                        className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
                                    />
                                </div>
                            ))}
                        </section>

                        <div>
                            <label className="text-sm font-bold">
                                Fonctionnalités
                            </label>

                            <textarea
                                rows={7}
                                value={form.data.features_text}
                                onChange={(event) =>
                                    form.setData(
                                        'features_text',
                                        event.target.value,
                                    )
                                }
                                placeholder={'Une fonctionnalité par ligne\nProtection anti-DDoS\nSauvegardes automatiques\nAccès SFTP'}
                                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
                            />
                        </div>

                        <section className="grid gap-4 md:grid-cols-2">
                            {[
                                [
                                    'stock_tracking',
                                    'Suivre le stock',
                                ],
                                [
                                    'allow_upgrades',
                                    'Autoriser les montées en gamme',
                                ],
                                [
                                    'allow_downgrades',
                                    'Autoriser les descentes en gamme',
                                ],
                                [
                                    'is_popular',
                                    'Mettre en avant',
                                ],
                            ].map(([field, label]) => (
                                <label
                                    key={field}
                                    className="flex items-center gap-3 rounded-xl border border-white/10 p-4"
                                >
                                    <input
                                        type="checkbox"
                                        checked={
                                            form.data[
                                                field as keyof typeof form.data
                                            ] as boolean
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                field as keyof typeof form.data,
                                                event.target.checked as never,
                                            )
                                        }
                                    />

                                    <span className="font-bold">
                                        {label}
                                    </span>
                                </label>
                            ))}
                        </section>

                        <section className="grid gap-5 md:grid-cols-2">
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
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
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
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
                                />
                            </div>
                        </section>

                        <div className="flex justify-end gap-3 border-t border-white/10 pt-7">
                            <Link
                                href="/admin/plans"
                                className="rounded-xl border border-white/10 px-6 py-3 font-bold"
                            >
                                Annuler
                            </Link>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-7 py-3 font-black disabled:opacity-50"
                            >
                                {form.processing
                                    ? 'Enregistrement...'
                                    : editing
                                      ? 'Enregistrer'
                                      : 'Créer l’offre'}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </>
    );
}