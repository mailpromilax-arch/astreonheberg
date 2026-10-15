import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';

type Universe = {
    slug: 'gaming' | 'web';
    title: string;
    description: string;
    items: string[];
    available_count: number;
    lowest_price_cents: number | null;
};

type Props = {
    universes: Universe[];
};

const imageByUniverse: Record<Universe['slug'], string> = {
    gaming: '/images/astreon/game.png',
    web: '/images/astreon/web.png',
};

const hrefByUniverse: Record<Universe['slug'], string> = {
    web: '/services-web',
    gaming: '/minecraft',
};

export default function StoreIndex({ universes }: Props) {
    return (
        <PublicLayout>
            <Head title="Boutique — Astreon" />

            <main className="min-h-screen bg-[#0b0714] text-white">
                <section className="bg-transparent px-5 py-14 text-center sm:py-20">
                    <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
                        Choisissez votre univers
                        <span className="text-orange-400"> d’hébergement.</span>
                    </h1>

                    <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                        Sélectionnez une catégorie pour découvrir les offres disponibles.
                    </p>
                </section>

                <section className="bg-transparent px-5 pb-16">
                    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 bg-transparent sm:grid-cols-2">
                        {universes.map((universe) => (
                            <Link
                                key={universe.slug}
                                href={hrefByUniverse[universe.slug]}
                                aria-label={`Découvrir les offres ${universe.title}`}
                                className="group block bg-transparent outline-none transition duration-200 hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-cyan-400"
                            >
                                <img
                                    src={imageByUniverse[universe.slug]}
                                    alt={`${universe.title} — ${universe.description}`}
                                    className="block h-auto w-full bg-transparent transition duration-300 group-hover:brightness-110"
                                />
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}