import { Head } from '@inertiajs/react';
import { Globe2 } from 'lucide-react';
import PublicLayout from '@/layouts/PublicLayout';

const offers = [
    {
        title: 'Minecraft Java',
        description: 'Vanilla, Paper, Forge, Fabric, plugins et modpacks.',
        button: 'Voir les offres Java',
        href: 'https://astreonheberg.fr/minecraft',
    },
    {
        title: 'Minecraft Bedrock',
        description: 'Serveurs Minecraft Bedrock pour mobiles, consoles et PC.',
        button: 'Voir les offres Bedrock',
        href: 'https://astreonheberg.fr/minecraft-bedrock',
    },
    {
        title: 'Hébergement Web',
        description: 'Pour sites vitrines, blogs, boutiques et agences.',
        button: 'Voir les offres Web',
        href: 'https://astreonheberg.fr/boutique/hebergement-web',
    },
];

export default function Catalog() {
    return (
        <PublicLayout>
            <Head title="Nos offres d’hébergement — AstreonHeberg" />

            <main className="min-h-[calc(100vh-80px)] bg-[#0b0715] px-5 py-14 text-white sm:py-20">
                <div className="mx-auto max-w-5xl">
                    <header className="text-center">
                        <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                            <Globe2 className="h-5 w-5" />
                        </div>

                        <h1 className="mt-5 text-3xl font-black tracking-tight text-violet-100 sm:text-4xl">
                            Choisissez votre hébergement
                        </h1>

                        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
                            Découvrez nos offres Minecraft Java, Bedrock et
                            d’hébergement Web. Choisissez la solution adaptée à
                            votre projet.
                        </p>
                    </header>

                    <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {offers.map((offer) => (
                            <article
                                key={offer.title}
                                className="flex min-h-[205px] flex-col rounded-2xl border border-white/10 bg-[#110c1d] p-5"
                            >
                                <h2 className="text-sm font-bold text-white">
                                    {offer.title}
                                </h2>

                                <p className="mt-3 flex-1 text-xs leading-5 text-slate-400">
                                    {offer.description}
                                </p>

                                <a
                                    href={offer.href}
                                    className="mt-5 rounded-full bg-violet-600 px-4 py-2.5 text-center text-xs font-bold text-white transition hover:bg-violet-500"
                                >
                                    {offer.button}
                                </a>
                            </article>
                        ))}
                    </section>
                </div>
            </main>
        </PublicLayout>
    );
}