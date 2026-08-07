import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Cloud,
    Gamepad2,
    Globe2,
    Layers3,
    Server,
} from 'lucide-react';
import PublicLayout from '@/layouts/PublicLayout';

type Universe = {
    slug: 'gaming' | 'vps' | 'web';
    title: string;
    description: string;
    items: string[];
    available_count: number;
    lowest_price_cents: number | null;
};

type Props = {
    universes: Universe[];
};

const euro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

const icons = {
    gaming: Gamepad2,
    vps: Cloud,
    web: Globe2,
};

const accents = {
    gaming: {
        border: 'hover:border-violet-300',
        icon: 'bg-violet-500/15 text-violet-300',
        badge: 'bg-violet-500/15 text-violet-200',
    },
    vps: {
        border: 'hover:border-violet-300',
        icon: 'bg-violet-500/15 text-violet-300',
        badge: 'bg-violet-500/15 text-violet-200',
    },
    web: {
        border: 'hover:border-violet-300',
        icon: 'bg-violet-500/15 text-violet-300',
        badge: 'bg-violet-500/15 text-violet-200',
    },
};

export default function StoreIndex({ universes }: Props) {
    return (
        <PublicLayout>
            <Head title="Boutique — Astreon" />

            <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
                <section className="relative overflow-hidden border-b border-slate-200 bg-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,.14),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(124,58,237,.10),transparent_36%)]" />

                    <div className="relative mx-auto max-w-6xl px-5 py-20 text-center lg:px-8 lg:py-28">
                        <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-[.22em] text-orange-600">
                            <Layers3 className="h-4 w-4" />
                            Boutique Astreon
                        </span>

                        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
                            Choisissez votre
                            <span className="text-orange-500"> univers d’hébergement.</span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                            Sélectionnez Game, VPS ou Web. Vous verrez ensuite uniquement les offres disponibles dans cette gamme.
                        </p>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
                    <div className="grid gap-7 lg:grid-cols-3">
                        {universes.map((universe) => {
                            const Icon = icons[universe.slug];
                            const accent = accents[universe.slug];

                            return (
                                <Link
                                    key={universe.slug}
                                    href={`/boutique/categorie/${universe.slug}`}
                                    className={`group flex min-h-[410px] flex-col rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-2xl ${accent.border}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <span className={`grid h-14 w-14 place-items-center rounded-2xl ${accent.icon}`}>
                                            <Icon className="h-7 w-7" />
                                        </span>

                                        <span className={`rounded-full px-3 py-1.5 text-xs font-black ${accent.badge}`}>
                                            {universe.available_count} disponible{universe.available_count > 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    <h2 className="mt-8 text-3xl font-black">
                                        {universe.title}
                                    </h2>

                                    <p className="mt-3 min-h-14 leading-7 text-slate-500">
                                        {universe.description}
                                    </p>

                                    <div className="mt-7 flex flex-wrap gap-2">
                                        {universe.items.map((item) => (
                                            <span
                                                key={item}
                                                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600"
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-auto border-t border-slate-100 pt-7">
                                        <div className="flex items-end justify-between gap-5">
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                                                    À partir de
                                                </p>
                                                <p className="mt-2 text-2xl font-black">
                                                    {universe.lowest_price_cents === null
                                                        ? 'Bientôt disponible'
                                                        : `${euro.format(universe.lowest_price_cents / 100)} / mois`}
                                                </p>
                                            </div>

                                            <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-950 text-white transition group-hover:bg-orange-500">
                                                <ArrowRight className="h-5 w-5" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="mt-10 flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-500">
                        <Server className="h-5 w-5 text-emerald-500" />
                        Toutes les offres affichées restent reliées au panier, au checkout et au provisionnement existants.
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
