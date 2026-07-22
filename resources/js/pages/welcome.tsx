import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

const products = [
    {
        name: 'Serveurs Gaming',
        description:
            'FiveM, Minecraft, ARK et Palworld sur une infrastructure performante et protégée.',
        price: '2,99 €',
        badge: 'Gaming',
        features: ['Activation rapide', 'Protection anti-DDoS', 'Sauvegardes', 'Panel intuitif'],
    },
    {
        name: 'VPS Cloud',
        description:
            'Des machines virtuelles flexibles pour héberger vos applications, bots et services.',
        price: '4,99 €',
        badge: 'Cloud',
        features: ['Disques NVMe', 'Accès administrateur', 'IPv4 dédiée', 'Réinstallation rapide'],
    },
    {
        name: 'Hébergement Web',
        description:
            'Une solution simple et rapide pour vos sites, boutiques et projets professionnels.',
        price: '1,99 €',
        badge: 'Web',
        features: ['SSL gratuit', 'E-mails professionnels', 'Bases de données', 'Sauvegardes'],
    },
];

const games = ['FiveM', 'Minecraft Java', 'Minecraft Bedrock', 'ARK', 'Palworld'];

const frequentlyAskedQuestions = [
    {
        question: 'Combien de temps prend la livraison ?',
        answer: 'Les services automatisés seront généralement livrés quelques secondes après la validation du paiement.',
    },
    {
        question: 'Les serveurs sont-ils protégés ?',
        answer: 'Nos futures infrastructures intégreront une protection réseau adaptée aux services Gaming, Web et VPS.',
    },
    {
        question: 'Puis-je changer d’offre plus tard ?',
        answer: 'Oui. Le tableau de bord permettra de demander une montée en gamme sans perdre les données du service.',
    },
    {
        question: 'Où seront hébergées les données ?',
        answer: 'Les premières infrastructures seront situées en France ou en Europe, selon les équipements sélectionnés.',
    },
];

function BrandMark() {
    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-400 shadow-lg shadow-blue-500/20">
            <span className="text-lg font-black text-white">A</span>
        </div>
    );
}

function CheckIcon() {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 shrink-0 text-emerald-400"
            aria-hidden="true"
        >
            <path
                fillRule="evenodd"
                d="M16.704 5.292a1 1 0 0 1 .004 1.416l-7.2 7.24a1 1 0 0 1-1.42 0l-3.8-3.82a1 1 0 1 1 1.418-1.412l3.09 3.105 6.49-6.525a1 1 0 0 1 1.418-.004Z"
                clipRule="evenodd"
            />
        </svg>
    );
}

export default function Welcome() {
    const [openQuestion, setOpenQuestion] = useState<number | null>(0);

    return (
        <>
            <Head title="AstreonHeberg — Gaming, VPS et Web">
                <meta
                    name="description"
                    content="AstreonHeberg propose des serveurs Gaming, des VPS Cloud et des hébergements Web performants."
                />
            </Head>

            <div className="min-h-screen bg-[#050b18] text-white">
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
                    <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
                    <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
                </div>

                <header className="relative z-20 border-b border-white/10 bg-[#050b18]/80 backdrop-blur-xl">
                    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                        <Link href="/" className="flex items-center gap-3">
                            <BrandMark />
                            <div>
                                <p className="text-lg font-black tracking-tight">AstreonHeberg</p>
                                <p className="text-xs text-slate-400">Gaming · VPS · Web</p>
                            </div>
                        </Link>

                        <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
                            <a href="#services" className="transition hover:text-white">
                                Services
                            </a>
                            <a href="#infrastructure" className="transition hover:text-white">
                                Infrastructure
                            </a>
                            <a href="#faq" className="transition hover:text-white">
                                FAQ
                            </a>
                            <a href="#contact" className="transition hover:text-white">
                                Contact
                            </a>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white sm:block"
                            >
                                Connexion
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5"
                            >
                                Créer un compte
                            </Link>
                        </div>
                    </nav>
                </header>

                <main className="relative z-10">
                    <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
                        <div>
                            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
                                Nouvelle plateforme française
                            </div>

                            <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                                Propulsez vos projets avec une
                                <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                                    infrastructure nouvelle génération.
                                </span>
                            </h1>

                            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
                                Serveurs Gaming, VPS Cloud et hébergements Web réunis dans une
                                plateforme rapide, transparente et pensée pour les communautés.
                            </p>

                            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                                <a
                                    href="#services"
                                    className="rounded-2xl bg-gradient-to-r from-blue-500 to-emerald-400 px-7 py-4 text-center font-bold shadow-xl shadow-blue-500/20 transition hover:-translate-y-1"
                                >
                                    Découvrir les offres
                                </a>
                                <a
                                    href="#infrastructure"
                                    className="rounded-2xl border border-white/15 bg-white/5 px-7 py-4 text-center font-bold backdrop-blur transition hover:border-white/30 hover:bg-white/10"
                                >
                                    Notre infrastructure
                                </a>
                            </div>

                            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-white/10 pt-8">
                                <div>
                                    <p className="text-2xl font-black">99,9 %</p>
                                    <p className="mt-1 text-xs text-slate-400">Disponibilité visée</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-black">&lt; 60 s</p>
                                    <p className="mt-1 text-xs text-slate-400">Livraison automatisée</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-black">24/7</p>
                                    <p className="mt-1 text-xs text-slate-400">Supervision future</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-blue-500/30 to-emerald-400/20 blur-3xl" />

                            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl backdrop-blur-xl">
                                <div className="mb-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-400">
                                            Astreon Control Center
                                        </p>
                                        <p className="mt-1 text-xl font-black">Infrastructure</p>
                                    </div>
                                    <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                                        Tous les systèmes opérationnels
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        ['Node Gaming FR-01', '42 %', 'En ligne'],
                                        ['Cloud VPS FR-01', '31 %', 'En ligne'],
                                        ['Web Cluster FR-01', '18 %', 'En ligne'],
                                    ].map(([name, usage, status], index) => (
                                        <div
                                            key={name}
                                            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold">{name}</p>
                                                    <p className="mt-1 text-xs text-slate-400">{status}</p>
                                                </div>
                                                <span className="text-sm font-bold text-emerald-300">
                                                    {usage}
                                                </span>
                                            </div>

                                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                                                    style={{
                                                        width: `${[42, 31, 18][index]}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-5 grid grid-cols-3 gap-3">
                                    {['API', 'Paiements', 'Réseau'].map((service) => (
                                        <div
                                            key={service}
                                            className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center"
                                        >
                                            <span className="mx-auto mb-2 block h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                                            <p className="text-xs font-semibold text-slate-300">{service}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="services" className="border-y border-white/10 bg-white/[0.02] py-24">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="mx-auto max-w-3xl text-center">
                                <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-400">
                                    Nos services
                                </p>
                                <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                                    Une plateforme pour tous vos projets
                                </h2>
                                <p className="mt-5 text-lg text-slate-400">
                                    Des offres accessibles, évolutives et administrables depuis un seul
                                    espace client.
                                </p>
                            </div>

                            <div className="mt-14 grid gap-7 lg:grid-cols-3">
                                {products.map((product, index) => (
                                    <article
                                        key={product.name}
                                        className={`group relative overflow-hidden rounded-3xl border p-7 transition duration-300 hover:-translate-y-2 ${
                                            index === 0
                                                ? 'border-blue-400/40 bg-blue-500/10'
                                                : 'border-white/10 bg-white/[0.04]'
                                        }`}
                                    >
                                        {index === 0 && (
                                            <div className="absolute right-5 top-5 rounded-full bg-blue-500 px-3 py-1 text-xs font-black">
                                                Populaire
                                            </div>
                                        )}

                                        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-emerald-300">
                                            {product.badge}
                                        </span>

                                        <h3 className="mt-6 text-2xl font-black">{product.name}</h3>
                                        <p className="mt-3 min-h-20 leading-7 text-slate-400">
                                            {product.description}
                                        </p>

                                        <div className="mt-7">
                                            <span className="text-sm text-slate-400">À partir de</span>
                                            <div className="mt-1 flex items-end gap-2">
                                                <span className="text-4xl font-black">{product.price}</span>
                                                <span className="pb-1 text-sm text-slate-400">/mois</span>
                                            </div>
                                        </div>

                                        <ul className="mt-7 space-y-3">
                                            {product.features.map((feature) => (
                                                <li
                                                    key={feature}
                                                    className="flex items-center gap-3 text-sm text-slate-300"
                                                >
                                                    <CheckIcon />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            type="button"
                                            className="mt-8 w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-bold transition group-hover:border-emerald-400/40 group-hover:bg-emerald-400/10"
                                        >
                                            Voir les offres
                                        </button>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="py-24">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="grid gap-12 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-blue-500/10 to-emerald-400/5 p-8 lg:grid-cols-2 lg:p-14">
                                <div>
                                    <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-400">
                                        Gaming
                                    </p>
                                    <h2 className="mt-4 text-4xl font-black">
                                        Vos communautés méritent de vraies performances.
                                    </h2>
                                    <p className="mt-5 leading-8 text-slate-300">
                                        Déployez votre serveur, gérez ses ressources et accédez à son
                                        panel depuis l’espace client AstreonHeberg.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                    {games.map((game) => (
                                        <div
                                            key={game}
                                            className="flex min-h-28 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-center font-bold transition hover:border-emerald-400/40 hover:bg-emerald-400/5"
                                        >
                                            {game}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="infrastructure" className="border-y border-white/10 bg-white/[0.02] py-24">
                        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:px-8">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-400">
                                    Infrastructure
                                </p>
                                <h2 className="mt-4 text-4xl font-black">
                                    Conçue pour rester rapide, disponible et évolutive.
                                </h2>
                                <p className="mt-6 leading-8 text-slate-300">
                                    AstreonHeberg séparera le site principal, les paiements et les
                                    nœuds clients. Une panne d’un serveur de jeu ne devra jamais rendre
                                    l’espace client indisponible.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {[
                                    ['NVMe', 'Stockages rapides pour réduire les temps de chargement.'],
                                    ['Anti-DDoS', 'Protection adaptée aux attaques visant les services publics.'],
                                    ['Sauvegardes', 'Copies indépendantes et restaurations simplifiées.'],
                                    ['Monitoring', 'Surveillance des services et publication de leur statut.'],
                                ].map(([title, description]) => (
                                    <div
                                        key={title}
                                        className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
                                    >
                                        <h3 className="text-xl font-black">{title}</h3>
                                        <p className="mt-3 text-sm leading-6 text-slate-400">
                                            {description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="faq" className="py-24">
                        <div className="mx-auto max-w-4xl px-6">
                            <div className="text-center">
                                <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-400">
                                    Questions fréquentes
                                </p>
                                <h2 className="mt-4 text-4xl font-black">
                                    Tout ce qu’il faut savoir
                                </h2>
                            </div>

                            <div className="mt-12 space-y-4">
                                {frequentlyAskedQuestions.map((item, index) => {
                                    const isOpen = openQuestion === index;

                                    return (
                                        <div
                                            key={item.question}
                                            className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setOpenQuestion(isOpen ? null : index)
                                                }
                                                className="flex w-full items-center justify-between gap-6 p-6 text-left"
                                            >
                                                <span className="font-bold">{item.question}</span>
                                                <span className="text-2xl text-emerald-400">
                                                    {isOpen ? '−' : '+'}
                                                </span>
                                            </button>

                                            {isOpen && (
                                                <div className="border-t border-white/10 px-6 py-5 leading-7 text-slate-400">
                                                    {item.answer}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section id="contact" className="px-6 pb-24">
                        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-blue-400/20 bg-gradient-to-r from-blue-600/30 to-emerald-500/20 p-10 text-center shadow-2xl shadow-blue-500/10 lg:p-16">
                            <h2 className="text-4xl font-black sm:text-5xl">
                                Prêt à rejoindre AstreonHeberg ?
                            </h2>
                            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
                                Créez votre compte et préparez dès maintenant vos futurs services
                                Gaming, VPS et Web.
                            </p>
                            <Link
                                href="/register"
                                className="mt-8 inline-flex rounded-2xl bg-white px-7 py-4 font-black text-slate-950 transition hover:-translate-y-1"
                            >
                                Créer mon compte
                            </Link>
                        </div>
                    </section>
                </main>

                <footer className="relative z-10 border-t border-white/10 py-10">
                    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between lg:px-8">
                        <div className="flex items-center gap-3">
                            <BrandMark />
                            <div>
                                <p className="font-bold text-white">AstreonHeberg</p>
                                <p>Gaming · VPS · Web</p>
                            </div>
                        </div>

                        <p>© {new Date().getFullYear()} AstreonHeberg. Tous droits réservés.</p>

                        <div className="flex gap-5">
                            <a href="#" className="hover:text-white">
                                Mentions légales
                            </a>
                            <a href="#" className="hover:text-white">
                                Confidentialité
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}