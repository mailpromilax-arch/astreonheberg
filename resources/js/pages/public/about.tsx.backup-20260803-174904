import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Bolt, CheckCircle2, Cloud, HeartHandshake, Rocket, Server, ShieldCheck, Sparkles, Users } from 'lucide-react';
import PublicHeader from '@/components/astreon/PublicHeader';

const strengths = [
    { icon: Bolt, title: 'Performance', description: 'Des ressources rapides, du stockage NVMe et une infrastructure pensée pour les charges exigeantes.' },
    { icon: ShieldCheck, title: 'Sécurité', description: 'Protection réseau, isolation des services et surveillance continue de notre infrastructure.' },
    { icon: Rocket, title: 'Déploiement automatique', description: 'Votre service est créé automatiquement dès que le paiement est confirmé.' },
    { icon: HeartHandshake, title: 'Support réactif', description: 'Une assistance accessible par tickets et Discord pour vous accompagner rapidement.' },
];

const values = ['Transparence', 'Rapidité', 'Qualité', 'Innovation'];
const figures = [
    ['99,9 %', 'Objectif de disponibilité'],
    ['24/7', 'Surveillance'],
    ['Automatique', 'Déploiement'],
    ['France', 'Infrastructure'],
];

export default function About() {
    return (
        <>
            <Head title="À propos — Astreon" />
            <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
                <PublicHeader />

                <main>
                    <section className="relative overflow-hidden border-b border-slate-200 bg-white">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,.14),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(124,58,237,.10),transparent_38%)]" />
                        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-28">
                            <div>
                                <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-[.2em] text-orange-600">
                                    <Sparkles className="h-4 w-4" />
                                    À propos d’Astreon
                                </span>

                                <h1 className="mt-7 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
                                    L’hébergement pensé pour être
                                    <span className="text-orange-500"> simple, rapide et fiable.</span>
                                </h1>

                                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                                    Astreon propose des serveurs de jeux, des VPS Cloud et des solutions web conçues pour offrir de bonnes performances, une gestion claire et un déploiement automatisé.
                                </p>

                                <div className="mt-9 flex flex-wrap gap-4">
                                    <Link href="/boutique" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-4 font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600">
                                        Découvrir nos offres
                                        <ArrowRight className="h-5 w-5" />
                                    </Link>

                                    <a href="https://discord.gg/3fZ6xye97x" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-4 font-black text-slate-700 transition hover:border-orange-300 hover:text-orange-600">
                                        Rejoindre Discord
                                        <Users className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {figures.map(([value, label]) => (
                                    <article key={label} className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/50">
                                        <p className="text-3xl font-black text-orange-500">{value}</p>
                                        <p className="mt-2 text-sm font-bold text-slate-500">{label}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
                        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
                            <div>
                                <span className="text-sm font-black uppercase tracking-[.2em] text-orange-500">Notre mission</span>
                                <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Rendre l’hébergement accessible sans sacrifier la qualité.</h2>
                                <p className="mt-5 leading-8 text-slate-600">
                                    Nous voulons permettre aux joueurs, créateurs, communautés et entreprises de lancer leurs projets rapidement, avec des offres lisibles et une infrastructure adaptée à leurs besoins.
                                </p>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                {strengths.map(({ icon: Icon, title, description }) => (
                                    <article key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-orange-600">
                                            <Icon className="h-6 w-6" />
                                        </span>
                                        <h3 className="mt-5 text-xl font-black">{title}</h3>
                                        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="border-y border-slate-200 bg-white">
                        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-2 lg:px-8">
                            <div className="rounded-3xl bg-slate-950 p-8 text-white sm:p-10">
                                <Cloud className="h-10 w-10 text-orange-400" />
                                <h2 className="mt-6 text-3xl font-black">Une plateforme construite pour évoluer.</h2>
                                <p className="mt-5 leading-8 text-slate-300">
                                    Astreon réunit la boutique, le paiement, le portefeuille, l’espace client, l’assistance et le provisionnement automatique dans une expérience cohérente.
                                </p>
                                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                    {['Paiements sécurisés', 'Panel client complet', 'Provisionnement Pterodactyl', 'Support centralisé'].map((item) => (
                                        <span key={item} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm font-bold">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-[#f8fafc] p-8 sm:p-10">
                                <Server className="h-10 w-10 text-orange-500" />
                                <h2 className="mt-6 text-3xl font-black">Nos valeurs</h2>
                                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                    {values.map((value, index) => (
                                        <div key={value} className="rounded-2xl border border-slate-200 bg-white p-5">
                                            <span className="text-xs font-black uppercase tracking-[.2em] text-orange-500">0{index + 1}</span>
                                            <p className="mt-3 text-lg font-black">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
                        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-orange-500 to-amber-400 px-7 py-12 text-white sm:px-12">
                            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <h2 className="text-3xl font-black sm:text-4xl">Prêt à lancer votre prochain projet ?</h2>
                                    <p className="mt-3 max-w-2xl text-orange-50">Explorez nos offres et déployez votre service en quelques minutes.</p>
                                </div>
                                <Link href="/boutique" className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-6 py-4 font-black text-orange-600 shadow-xl transition hover:-translate-y-0.5">
                                    Voir la boutique
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
