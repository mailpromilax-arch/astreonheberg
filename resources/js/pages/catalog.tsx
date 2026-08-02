import { Head, Link } from '@inertiajs/react';

type Plan = {
    id: number;
    name: string;
    sku: string;
    price_monthly_cents: number;
    ram_mb: number | null;
    disk_gb: number | null;
    cpu_percent: number | null;
    cpu_cores: number | null;
    player_slots: number | null;
    databases_limit: number | null;
    backups_limit: number | null;
    features: string[] | null;
    is_popular: boolean;
};

type Product = {
    id: number;
    name: string;
    slug: string;
    short_description: string | null;
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

const formatPrice = (cents: number) =>
    new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(cents / 100);

export default function Catalog({ categories }: Props) {
    return (
        <>
            <Head title="Nos offres — AstreonHeberg" />

            <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
                <header className="border-b border-slate-200 bg-[#f5f7fb]/90 backdrop-blur">
                    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                        <Link href="/" className="text-xl font-black">
                            Astreon<span className="text-orange-500">Heberg</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-sm text-slate-300 hover:text-slate-950">
                                Accueil
                            </Link>
                            <Link
                                href="/login"
                                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"
                            >
                                Connexion
                            </Link>
                        </div>
                    </nav>
                </header>

                <main className="mx-auto max-w-7xl px-6 py-20">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-500">
                            Catalogue
                        </p>
                        <h1 className="mt-4 text-5xl font-black">
                            Trouvez l’offre adaptée à votre projet
                        </h1>
                        <p className="mt-6 text-lg text-slate-500">
                            Gaming, VPS et Web : 28 offres administrées depuis un espace client unique.
                        </p>
                    </div>

                    <div className="mt-20 space-y-24">
                        {categories.map((category) => (
                            <section key={category.id}>
                                <div className="mb-10">
                                    <h2 className="text-3xl font-black">{category.name}</h2>
                                    <p className="mt-3 text-slate-500">{category.description}</p>
                                </div>

                                <div className="space-y-16">
                                    {category.products.map((product) => (
                                        <div key={product.id}>
                                            <div className="mb-7">
                                                <h3 className="text-2xl font-black">{product.name}</h3>
                                                <p className="mt-2 text-slate-500">
                                                    {product.short_description}
                                                </p>
                                            </div>

                                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                                                {product.plans.map((plan) => (
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

                                                        <h4 className="text-xl font-black">{plan.name}</h4>

                                                        <div className="mt-5">
                                                            <span className="text-4xl font-black">
                                                                {formatPrice(plan.price_monthly_cents)}
                                                            </span>
                                                            <span className="text-sm text-slate-500"> / mois</span>
                                                        </div>

                                                        <dl className="mt-6 space-y-3 text-sm">
                                                            {plan.ram_mb && (
                                                                <div className="flex justify-between">
                                                                    <dt className="text-slate-500">RAM</dt>
                                                                    <dd className="font-bold">
                                                                        {plan.ram_mb / 1024} Go
                                                                    </dd>
                                                                </div>
                                                            )}

                                                            {plan.cpu_cores && (
                                                                <div className="flex justify-between">
                                                                    <dt className="text-slate-500">vCPU</dt>
                                                                    <dd className="font-bold">{plan.cpu_cores}</dd>
                                                                </div>
                                                            )}

                                                            {plan.disk_gb && (
                                                                <div className="flex justify-between">
                                                                    <dt className="text-slate-500">Stockage</dt>
                                                                    <dd className="font-bold">
                                                                        {plan.disk_gb} Go NVMe
                                                                    </dd>
                                                                </div>
                                                            )}

                                                            {plan.player_slots && (
                                                                <div className="flex justify-between">
                                                                    <dt className="text-slate-500">Joueurs</dt>
                                                                    <dd className="font-bold">
                                                                        {plan.player_slots}
                                                                    </dd>
                                                                </div>
                                                            )}

                                                            <div className="flex justify-between">
                                                                <dt className="text-slate-500">Sauvegardes</dt>
                                                                <dd className="font-bold">
                                                                    {plan.backups_limit ?? 0}
                                                                </dd>
                                                            </div>
                                                        </dl>

                                                        <ul className="mt-6 space-y-2 text-sm text-slate-300">
                                                            {(plan.features ?? []).map((feature) => (
                                                                <li key={feature}>✓ {feature}</li>
                                                            ))}
                                                        </ul>

                                                        <button
                                                            type="button"
                                                            className="mt-7 w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 font-black"
                                                        >
                                                            Commander
                                                        </button>
                                                    </article>
                                                ))}
                                            </div>
                                        </div>
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