import { Head, Link } from '@inertiajs/react';


type Plan = {
    id: number;
    name: string;
    slug: string;
    price_monthly_cents: number;
    ram_mb: number | null;
    disk_gb: number | null;
    cpu_percent: number | null;
    cpu_cores: number | null;
    player_slots: number | null;
    is_popular: boolean;
};

type Product = {
    id: number;
    name: string;
    slug: string;
    short_description: string | null;
    is_featured: boolean;
    plans: Plan[];
};

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    products: Product[];
};

type Props = {
    categories: Category[];
};

const euro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

function lowestPrice(product: Product): string {
    if (product.plans.length === 0) {
        return 'Indisponible';
    }

    const cents = Math.min(
        ...product.plans.map((plan) => plan.price_monthly_cents),
    );

    return euro.format(cents / 100);
}

export default function StoreIndex({ categories }: Props) {
    return (
        <>
            <Head title="Boutique — AstreonHeberg" />

            <div className="min-h-screen bg-[#050b18] text-white">
                <header className="border-b border-white/10 bg-[#07101f]/90 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                        <Link href="/" className="text-xl font-black">
                            Astreon
                            <span className="text-emerald-400">
                                Heberg
                            </span>
                        </Link>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="rounded-xl px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/5"
                            >
                                Accueil
                            </Link>

                            <Link
                                href="/panier"
                                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/5"
                            >
                                Panier
                            </Link>

                            <Link
                                href="/login"
                                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/5"
                            >
                                Connexion
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 py-20">
                    <section className="mx-auto max-w-3xl text-center">
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-400">
                            Boutique
                        </p>

                        <h1 className="mt-4 text-5xl font-black">
                            Choisissez votre prochaine infrastructure
                        </h1>

                        <p className="mt-6 text-lg leading-8 text-slate-400">
                            Serveurs Gaming, VPS et hébergements Web,
                            tous administrables depuis un seul espace client.
                        </p>
                    </section>

                    <div className="mt-20 space-y-24">
                        {categories.map((category) => (
                            <section key={category.id}>
                                <div>
                                    <h2 className="text-3xl font-black">
                                        {category.name}
                                    </h2>

                                    <p className="mt-3 max-w-3xl text-slate-400">
                                        {category.description}
                                    </p>
                                </div>

                                <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                    {category.products.map((product) => (
                                        <article
                                            key={product.id}
                                            className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:-translate-y-1 hover:border-emerald-400/30"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-bold text-emerald-400">
                                                        {category.name}
                                                    </p>

                                                    <h3 className="mt-2 text-2xl font-black">
                                                        {product.name}
                                                    </h3>
                                                </div>

                                                {product.is_featured && (
                                                    <span className="rounded-full bg-purple-400/10 px-3 py-1 text-xs font-bold text-purple-300">
                                                        Recommandé
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-4 min-h-16 leading-7 text-slate-400">
                                                {product.short_description ??
                                                    'Découvrez cette offre AstreonHeberg.'}
                                            </p>

                                            <div className="mt-7 border-t border-white/10 pt-6">
                                                <p className="text-xs uppercase tracking-wider text-slate-500">
                                                    À partir de
                                                </p>

                                                <div className="mt-2 flex items-end gap-2">
                                                    <span className="text-3xl font-black">
                                                        {lowestPrice(product)}
                                                    </span>

                                                    {product.plans.length > 0 && (
                                                        <span className="pb-1 text-sm text-slate-500">
                                                            / mois
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-6 flex items-center justify-between">
                                                <span className="text-sm text-slate-500">
                                                    {product.plans.length}{' '}
                                                    offre
                                                    {product.plans.length > 1
                                                        ? 's'
                                                        : ''}
                                                </span>

                                                <Link
                                                    href={`/boutique/${product.slug}`}
                                                    className="rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-5 py-3 text-sm font-black"
                                                >
                                                    Voir les offres
                                                </Link>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}