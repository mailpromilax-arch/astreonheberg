import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Cloud,
    Gamepad2,
    Globe2,
    Server,
} from 'lucide-react';
import PublicLayout from '@/layouts/PublicLayout';

type Entry = {
    slug: string;
    label: string;
    description: string;
    href: string;
    available: boolean;
    plans_count: number;
    lowest_price_cents: number | null;
};

type Props = {
    universe: 'gaming' | 'vps' | 'web';
    title: string;
    description: string;
    entries: Entry[];
};

const euro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

const universeIcons = {
    gaming: Gamepad2,
    vps: Cloud,
    web: Globe2,
};

export default function StoreCategory({
    universe,
    title,
    description,
    entries,
}: Props) {
    const UniverseIcon = universeIcons[universe];

    return (
        <PublicLayout>
            <Head title={`${title} — Boutique Astreon`} />

            <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
                <section className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
                        <Link
                            href="/boutique"
                            className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-orange-600"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour à la boutique
                        </Link>

                        <div className="mt-9 flex flex-col gap-6 sm:flex-row sm:items-center">
                            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-orange-100 text-orange-600">
                                <UniverseIcon className="h-8 w-8" />
                            </span>

                            <div>
                                <p className="text-xs font-black uppercase tracking-[.22em] text-orange-500">
                                    Boutique / {universe === 'gaming' ? 'Game' : universe.toUpperCase()}
                                </p>
                                <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                                    {title}
                                </h1>
                                <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
                                    {description}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
                    <div className={`grid gap-6 ${entries.length === 1 ? 'max-w-2xl' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
                        {entries.map((entry) => (
                            <Link
                                key={entry.slug}
                                href={entry.href}
                                className="group flex min-h-[310px] flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white">
                                        {universe === 'gaming'
                                            ? <Gamepad2 className="h-6 w-6" />
                                            : universe === 'vps'
                                              ? <Cloud className="h-6 w-6" />
                                              : <Globe2 className="h-6 w-6" />}
                                    </span>

                                    <span className={`rounded-full px-3 py-1.5 text-xs font-black ${
                                        entry.available
                                            ? 'bg-emerald-50 text-emerald-600'
                                            : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {entry.available ? 'Disponible' : 'Bientôt'}
                                    </span>
                                </div>

                                <h2 className="mt-7 text-2xl font-black">
                                    {entry.label}
                                </h2>

                                <p className="mt-3 leading-7 text-slate-500">
                                    {entry.description}
                                </p>

                                <div className="mt-auto border-t border-slate-100 pt-6">
                                    <div className="flex items-end justify-between gap-5">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                                                {entry.plans_count} offre{entry.plans_count > 1 ? 's' : ''}
                                            </p>

                                            <p className="mt-2 text-xl font-black">
                                                {entry.lowest_price_cents === null
                                                    ? 'Consulter'
                                                    : `Dès ${euro.format(entry.lowest_price_cents / 100)} / mois`}
                                            </p>
                                        </div>

                                        <span className="grid h-10 w-10 place-items-center rounded-full bg-orange-500 text-white transition group-hover:translate-x-1">
                                            <ArrowRight className="h-5 w-5" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {entries.length === 0 && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
                            <Server className="mx-auto h-10 w-10 text-slate-400" />
                            <p className="mt-4 font-black">Aucune offre disponible.</p>
                        </div>
                    )}
                </section>
            </main>
        </PublicLayout>
    );
}
