import { Head, Link, router } from '@inertiajs/react';

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

type Props = {
    product: Product;
};

const euro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

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

export default function StoreShow({ product }: Props) {
    return (
        <>
            <Head title={`${product.name} — AstreonHeberg`} />

            <div className="min-h-screen bg-[#050b18] text-white">
                <header className="border-b border-white/10 bg-[#07101f]">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                        <Link href="/" className="text-xl font-black">
                            Astreon
                            <span className="text-emerald-400">
                                Heberg
                            </span>
                        </Link>

                        <Link
                            href="/boutique"
                            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold"
                        >
                            Retour à la boutique
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 py-16">
                    <section className="max-w-4xl">
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">
                            {product.category.name}
                        </p>

                        <h1 className="mt-4 text-5xl font-black">
                            {product.name}
                        </h1>

                        <p className="mt-6 text-lg leading-8 text-slate-400">
                            {product.description ??
                                product.short_description}
                        </p>
                    </section>

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
                                            : 'border-white/10 bg-white/[0.04]'
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
                                                plan.price_monthly_cents / 100,
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
                                                plan.setup_fee_cents / 100,
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
                                                    {plan.ram_mb / 1024} Go
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
                                        Object.keys(plan.specifications)
                                            .length > 0 && (
                                            <details className="mt-6 rounded-xl border border-white/10 bg-black/10 p-4">
                                                <summary className="cursor-pointer text-sm font-bold">
                                                    Caractéristiques avancées
                                                </summary>

                                                <dl className="mt-4 space-y-2 text-xs">
                                                    {Object.entries(
                                                        plan.specifications,
                                                    ).map(([key, value]) => (
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
                                                    ))}
                                                </dl>
                                            </details>
                                        )}

                                    <button
    type="button"
    disabled={unavailable}
    onClick={() =>
        router.post(`/panier/${plan.id}`, {
            quantity: 1,
        })
    }
    className="mt-7 w-full rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-5 py-3 font-black disabled:cursor-not-allowed disabled:opacity-40"
>
    {unavailable
        ? 'Rupture de stock'
        : 'Ajouter au panier'}
</button>
                                </article>
                            );
                        })}
                    </section>

                    {product.plans.length === 0 && (
                        <div className="mt-14 rounded-3xl border border-white/10 bg-white/[0.04] p-12 text-center text-slate-400">
                            Aucune offre n’est actuellement disponible pour ce
                            produit.
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}