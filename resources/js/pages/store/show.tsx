import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { CircleCheckBig } from 'lucide-react';

type Plan = {
    id: number;
    name: string;
    slug: string;
    sku: string;
    price_monthly_cents: number;
    setup_fee_cents: number;
    ram_mb: number | null;
    disk_gb: number | null;
    cpu_percent: number | null;
    cpu_cores: number | null;
    databases_limit: number | null;
    backups_limit: number | null;
    player_slots: number | null;
    features: string[] | null;
    specifications: Record<string, unknown> | null;
    stock_quantity: number | null;
    stock_tracking: boolean;
    status: string;
    is_popular: boolean;
};

type Product = {
    id: number;
    name: string;
    slug: string;
    short_description: string | null;
    description: string | null;
    category: {
        id: number;
        name: string;
        slug: string;
    };
    plans: Plan[];
};

type ArkEdition = {
    value: 'survival-evolved' | 'survival-ascended';
    label: string;
    description: string;
};

type Props = {
    product: Product;
    catalogSlug?: string;
    arkEditions?: ArkEdition[];
};

const euro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

/**
 * Les offres enregistrent la RAM en Mo.
 *
 * Exemples :
 * 4096 Mo  = 4 Go
 * 8192 Mo  = 8 Go
 * 10240 Mo = 10 Go
 * 12288 Mo = 12 Go
 *
 * L'affichage est volontairement limité à un nombre entier.
 */
function formatRam(ramMb: number): string {
    const ramGb = Math.round(ramMb / 1024);

    return `${ramGb} Go`;
}

function displayValue(value: unknown): string {
    if (typeof value === 'boolean') {
        return value ? 'Oui' : 'Non';
    }

    if (Array.isArray(value)) {
        return value.join(', ');
    }

    if (value === null || value === undefined || value === '') {
        return '—';
    }

    return String(value);
}

export default function StoreShow({
    product,
    catalogSlug,
    arkEditions = [],
}: Props) {
    const isArk = catalogSlug === 'ark';
    const [arkEdition, setArkEdition] = useState<
        ArkEdition['value'] | ''
    >('');
    return (
        <>
            <Head title={`${product.name} — AstreonHeberg`} />

            <div className="min-h-screen bg-[#f5f7fb] text-slate-950">

                <main className="mx-auto max-w-7xl px-6 py-16">
                    <section className="max-w-4xl">
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-500">
                            {product.category.name}
                        </p>

                        <h1 className="mt-4 text-5xl font-black">
                            {product.name}
                        </h1>

                        <p className="mt-6 text-lg leading-8 text-slate-500">
                            {product.description ??
                                product.short_description}
                        </p>
                    </section>

                    {isArk && (
                        <section className="mt-10 rounded-3xl border border-violet-400/25 bg-[#120d21] p-7">
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-300">
                                Étape obligatoire
                            </p>

                            <h2 className="mt-3 text-2xl font-black">
                                Choisissez votre version de ARK
                            </h2>

                            <p className="mt-2 text-sm text-slate-400">
                                Ce choix détermine automatiquement le bon Egg Pterodactyl lors de la création du serveur.
                            </p>

                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                {arkEditions.map((edition) => {
                                    const selected =
                                        arkEdition === edition.value;

                                    return (
                                        <button
                                            key={edition.value}
                                            type="button"
                                            aria-pressed={selected}
                                            onClick={() =>
                                                setArkEdition(edition.value)
                                            }
                                            className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all duration-200 ${
                                                selected
                                                    ? 'border-violet-300 bg-violet-500/20 shadow-[0_0_38px_rgba(168,85,247,0.28)] ring-2 ring-violet-400/50'
                                                    : 'border-violet-400/20 bg-[#0b0813] hover:-translate-y-0.5 hover:border-violet-400/60 hover:bg-violet-500/5'
                                            }`}
                                        >
                                            {selected && (
                                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-500" />
                                            )}

                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <span
                                                        className={`block text-lg font-black transition ${
                                                            selected
                                                                ? 'text-white'
                                                                : 'text-slate-200'
                                                        }`}
                                                    >
                                                        {edition.label}
                                                    </span>

                                                    <span
                                                        className={`mt-2 block text-sm leading-6 ${
                                                            selected
                                                                ? 'text-violet-100'
                                                                : 'text-slate-400'
                                                        }`}
                                                    >
                                                        {edition.description}
                                                    </span>
                                                </div>

                                                <div
                                                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition ${
                                                        selected
                                                            ? 'border-violet-200 bg-violet-500 text-white shadow-lg shadow-violet-500/35'
                                                            : 'border-violet-400/25 bg-[#120d21] text-slate-600 group-hover:border-violet-400/60 group-hover:text-violet-300'
                                                    }`}
                                                >
                                                    {selected ? (
                                                        <CircleCheckBig className="h-6 w-6" />
                                                    ) : (
                                                        <span className="h-3.5 w-3.5 rounded-full border-2 border-current" />
                                                    )}
                                                </div>
                                            </div>

                                            {selected && (
                                                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-violet-300/30 bg-violet-500/20 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-violet-100">
                                                    <CircleCheckBig className="h-4 w-4" />
                                                    Version sélectionnée
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {arkEdition ? (
                                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100">
                                    <CircleCheckBig className="h-5 w-5 shrink-0 text-emerald-400" />

                                    <p>
                                        Version sélectionnée :{' '}
                                        <strong className="text-white">
                                            {arkEdition ===
                                            'survival-ascended'
                                                ? 'ARK: Survival Ascended'
                                                : 'ARK: Survival Evolved'}
                                        </strong>
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-4 text-sm font-bold text-amber-300">
                                    Sélectionnez une version avant d’ajouter une offre au panier.
                                </p>
                            )}
                        </section>
                    )}

                    <section className="mt-14 grid gap-7 md:grid-cols-2 xl:grid-cols-4">
                        {product.plans.map((plan) => {
                            const unavailable =
                                plan.stock_tracking &&
                                (plan.stock_quantity ?? 0) <= 0;

                            return (
                                <article
                                    key={plan.id}
                                    className={`relative rounded-3xl border p-6 ${
                                        plan.is_popular
                                            ? 'border-emerald-400/50 bg-emerald-400/10'
                                            : 'border-slate-200 bg-white'
                                    }`}
                                >
                                    {plan.is_popular && (
                                        <span className="absolute -top-3 right-5 rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-slate-950">
                                            Populaire
                                        </span>
                                    )}

                                    <h2 className="text-2xl font-black">
                                        {plan.name}
                                    </h2>

                                    <p className="mt-2 text-xs text-slate-500">
                                        {plan.sku}
                                    </p>

                                    <div className="mt-6">
                                        <span className="text-4xl font-black">
                                            {euro.format(
                                                plan.price_monthly_cents /
                                                    100,
                                            )}
                                        </span>

                                        <span className="text-sm text-slate-500">
                                            {' '}
                                            / mois
                                        </span>
                                    </div>

                                    {plan.setup_fee_cents > 0 && (
                                        <p className="mt-2 text-xs text-slate-500">
                                            +{' '}
                                            {euro.format(
                                                plan.setup_fee_cents /
                                                    100,
                                            )}{' '}
                                            de mise en service
                                        </p>
                                    )}

                                    <dl className="mt-7 space-y-3 text-sm">
                                        {plan.ram_mb !== null && (
                                            <div className="flex justify-between gap-4">
                                                <dt className="text-slate-500">
                                                    RAM
                                                </dt>

                                                <dd className="font-bold">
                                                    {formatRam(
                                                        plan.ram_mb,
                                                    )}
                                                </dd>
                                            </div>
                                        )}

                                        {plan.disk_gb !== null && (
                                            <div className="flex justify-between gap-4">
                                                <dt className="text-slate-500">
                                                    Stockage
                                                </dt>

                                                <dd className="font-bold">
                                                    {plan.disk_gb} Go NVMe
                                                </dd>
                                            </div>
                                        )}

                                        {(plan.cpu_cores !== null ||
                                            plan.cpu_percent !== null) && (
                                            <div className="flex justify-between gap-4">
                                                <dt className="text-slate-500">
                                                    CPU
                                                </dt>

                                                <dd className="font-bold">
                                                    {plan.cpu_cores !== null
                                                        ? `${plan.cpu_cores} vCPU`
                                                        : `${plan.cpu_percent} %`}
                                                </dd>
                                            </div>
                                        )}

                                        {plan.player_slots !== null && (
                                            <div className="flex justify-between gap-4">
                                                <dt className="text-slate-500">
                                                    Joueurs
                                                </dt>

                                                <dd className="font-bold">
                                                    {plan.player_slots}
                                                </dd>
                                            </div>
                                        )}

                                        {plan.databases_limit !== null && (
                                            <div className="flex justify-between gap-4">
                                                <dt className="text-slate-500">
                                                    Bases de données
                                                </dt>

                                                <dd className="font-bold">
                                                    {
                                                        plan.databases_limit
                                                    }
                                                </dd>
                                            </div>
                                        )}

                                        {plan.backups_limit !== null && (
                                            <div className="flex justify-between gap-4">
                                                <dt className="text-slate-500">
                                                    Sauvegardes
                                                </dt>

                                                <dd className="font-bold">
                                                    {plan.backups_limit}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>

                                    <ul className="mt-7 space-y-2 text-sm text-slate-300">
                                        {(plan.features ?? []).map(
                                            (feature) => (
                                                <li key={feature}>
                                                    ✓ {feature}
                                                </li>
                                            ),
                                        )}
                                    </ul>

                                    {plan.specifications &&
                                        Object.keys(
                                            plan.specifications,
                                        ).length > 0 && (
                                            <details className="mt-6 rounded-xl border border-slate-200 bg-black/10 p-4">
                                                <summary className="cursor-pointer text-sm font-bold">
                                                    Caractéristiques
                                                    avancées
                                                </summary>

                                                <dl className="mt-4 space-y-2 text-xs">
                                                    {Object.entries(
                                                        plan.specifications,
                                                    ).map(
                                                        ([key, value]) => (
                                                            <div
                                                                key={key}
                                                                className="flex justify-between gap-4"
                                                            >
                                                                <dt className="text-slate-500">
                                                                    {key}
                                                                </dt>

                                                                <dd className="text-right font-semibold">
                                                                    {displayValue(
                                                                        value,
                                                                    )}
                                                                </dd>
                                                            </div>
                                                        ),
                                                    )}
                                                </dl>
                                            </details>
                                        )}

                                    <button
                                        type="button"
                                        disabled={unavailable || (isArk && !arkEdition)}
                                        onClick={() => {
                                            router.post(
                                                `/panier/${plan.id}`,
                                                {
                                                    quantity: 1,
                                                    ark_edition:
                                                        isArk
                                                            ? arkEdition
                                                            : null,
                                                },
                                            );
                                        }}
                                        className="mt-7 w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 font-black disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {unavailable
                                            ? 'Rupture de stock'
                                            : isArk && !arkEdition
                                              ? 'Choisissez une version'
                                              : 'Ajouter au panier'}
                                    </button>
                                </article>
                            );
                        })}
                    </section>

                    {product.plans.length === 0 && (
                        <div className="mt-14 rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
                            Aucune offre n’est actuellement disponible
                            pour ce produit.
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}