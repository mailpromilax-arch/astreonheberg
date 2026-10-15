import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    Check,
    Cpu,
    Gamepad2,
    Headphones,
    Layers,
    MapPin,
    Network,
    Rocket,
    Server,
    ShieldCheck,
    UsersRound,
    Zap,
    Users,
    Database,
} from 'lucide-react';
import PublicLayout from '@/layouts/PublicLayout';

const games = [
    ['Minecraft Java', '/minecraft'],
    ['Minecraft Bedrock', '/minecraft-bedrock'],
    ['Hébergement Web', '/services-web'],
] as const;

const guarantees = [
    [Activity, 'Haute disponibilité', 'Une infrastructure supervisée pour maintenir vos services accessibles.'],
    [Headphones, 'Assistance réactive', 'Une équipe disponible pour vous accompagner rapidement.'],
    [Rocket, 'Mise en service instantanée', 'Vos services automatisés sont livrés quelques secondes après paiement.'],
    [Cpu, 'Performance maximale', 'CPU haute fréquence, mémoire rapide et stockage NVMe.'],
    [MapPin, 'Hébergement en France', 'Une infrastructure proche de vos utilisateurs et maîtrisée.'],
    [ShieldCheck, 'Anti-DDoS professionnel', 'Filtrage réseau adapté aux services Gaming et Web.'],
];

const technologies = [
    ['AMD', 'amd'],
    ['Pterodactyl', 'pterodactyl'],
    ['Docker', 'docker'],
    ['Nginx', 'nginx'],
    ['MySQL', 'mysql'],
] as const;

const repeatedTechnologies = [...technologies, ...technologies, ...technologies];

export default function Welcome() {
    return (
        <PublicLayout>
            <Head title="Astreon — Gaming et Web" />

            <main>
                <section id="section-0" className="astreon-hero relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_30%,rgba(249,115,22,.18),transparent_32%),radial-gradient(circle_at_20%_80%,rgba(249,115,22,.08),transparent_28%)]" />
                    <div className="astreon-grid absolute inset-0 opacity-40" />

                    <div className="relative mx-auto grid min-h-[690px] max-w-6xl items-center gap-16 px-6 py-20 lg:grid-cols-[1.15fr_.85fr]">
                        <div>
                            <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-300">
                                {['FR Hébergement en France', 'Protection Anti-DDoS', 'Réseau optimisé'].map((label) => (
                                    <span
                                        key={label}
                                        className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2"
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>

                            <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
                                Une infrastructure <br />
                                puissante, rapide
                                <br />
                                et <span className="text-orange-500">protégée.</span>
                            </h1>

                            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
                                Astreon propose des solutions d’hébergement performantes pour vos serveurs de jeux et projets web, avec une infrastructure française et une gestion entièrement automatisée.
                            </p>

                            <div className="mt-9 flex flex-wrap gap-4">
                                <Link href="/boutique" className="astreon-primary-button px-7 py-4">
                                    <Server className="h-5 w-5" />
                                    Découvrir nos offres
                                </Link>

                                <a
                                    href="https://discord.gg/3fZ6xye97x"
                                    className="inline-flex items-center gap-2 rounded-2xl border border-indigo-400/30 bg-indigo-500/10 px-7 py-4 font-black text-indigo-100 transition hover:bg-indigo-500/20"
                                >
                                    <Gamepad2 className="h-5 w-5" />
                                    Notre Discord
                                </a>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-6 text-sm text-slate-400">
                                <span>⚡ Livraison automatisée</span>
                                <span>✓ Anti-DDoS inclus</span>
                                <span>📍 Hébergé en France</span>
                            </div>
                        </div>

                        <div className="relative mx-auto grid min-h-[420px] w-full max-w-md place-items-center">
                            <img
                                src="/images/astreon/game-web-neon.png"
                                alt="Gaming et hébergement Web Astreon"
                                className="h-auto w-full object-contain drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </section>

                <section
                    id="section-1"
                    className="overflow-hidden border-b border-white/10 bg-transparent py-10"
                >
                    <div className="tech-marquee">
                        <div className="tech-marquee-entry">
                            <div className="tech-marquee-track">
                                {[0, 1].map((copy) => (
                                    <div
                                        key={copy}
                                        className="tech-marquee-group"
                                        aria-hidden={copy === 1 ? 'true' : undefined}
                                    >
                                        {repeatedTechnologies.map(([name, slug], index) => (
                                            <div
                                                key={`${copy}-${index}-${name}`}
                                                className="tech-marquee-logo"
                                            >
                                                <img
                                                    src={`https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/${slug}.svg`}
                                                    alt={copy === 0 ? name : ''}
                                                    title={copy === 0 ? name : undefined}
                                                    loading="lazy"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <style>{`
                        .tech-marquee {
                            width: 100%;
                            overflow: hidden;
                            mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
                            -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
                        }

                        .tech-marquee-entry {
                            width: max-content;
                        }

                        .tech-marquee-track {
                            display: flex;
                            width: max-content;
                            animation: tech-marquee-scroll 22s linear infinite;
                            will-change: transform;
                        }

                        .tech-marquee-group {
                            display: flex;
                            flex: none;
                            align-items: center;
                            gap: 72px;
                            padding-right: 72px;
                        }

                        .tech-marquee-logo {
                            display: grid;
                            width: 64px;
                            height: 64px;
                            flex: none;
                            place-items: center;
                        }

                        .tech-marquee-logo img {
                            display: block;
                            width: 48px;
                            height: 48px;
                            object-fit: contain;
                            filter: brightness(0) invert(1);
                            opacity: 0.9;
                        }

                        @keyframes tech-marquee-scroll {
                            from {
                                transform: translateX(0);
                            }
                            to {
                                transform: translateX(-50%);
                            }
                        }
                    `}</style>
                </section>

                <section className="relative isolate overflow-hidden bg-transparent py-24 text-white sm:py-28">
                    <div className="pointer-events-none absolute -left-32 -top-44 h-80 w-80 rounded-full border border-violet-400/30 bg-violet-600/10 shadow-[0_0_80px_rgba(139,92,246,0.28)]" />
                    <div className="pointer-events-none absolute -right-32 top-20 h-72 w-72 rounded-full border border-violet-400/20 bg-violet-600/10 shadow-[0_0_80px_rgba(139,92,246,0.2)]" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(91,33,182,.2),transparent_55%)]" />

                    <div className="relative mx-auto max-w-6xl px-6">
                        <div className="text-center">
                            <span className="inline-flex rounded-full border border-violet-400/40 bg-violet-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200">
                                Une infrastructure pensée pour vous
                            </span>

                            <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                                Une infrastructure conçue pour
                                <br />
                                <span className="bg-gradient-to-r from-white via-violet-200 to-violet-400 bg-clip-text text-transparent">
                                    les projets exigeants
                                </span>
                            </h2>

                            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300">
                                Des solutions fiables, évolutives et sécurisées pour accompagner
                                <br className="hidden sm:block" />
                                chaque étape de votre croissance.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                [Activity, 'Performance', 'Des ressources optimisées pour des performances durables, même sous forte charge.'],
                                [ShieldCheck, 'Protection', 'Une sécurité renforcée pour vos données et vos applications, à chaque instant.'],
                                [Layers, 'Évolutivité', 'Une infrastructure qui s’adapte à vos ambitions, aujourd’hui et demain.'],
                                [UsersRound, 'Accompagnement', 'Des experts à vos côtés pour vous conseiller et vous aider à aller plus loin.'],
                            ].map(([Icon, title, text]) => (
                                <article
                                    key={title as string}
                                    className="group min-h-52 rounded-2xl border border-violet-400/40 bg-gradient-to-br from-violet-500/[0.12] via-[#100b20]/90 to-[#0b0813] p-6 shadow-[0_0_24px_rgba(124,58,237,0.12)] transition duration-300 hover:-translate-y-1 hover:border-violet-300/70 hover:shadow-[0_0_32px_rgba(139,92,246,0.24)]"
                                >
                                    <span className="grid h-16 w-16 place-items-center rounded-2xl border border-violet-400/40 bg-gradient-to-br from-violet-500/25 to-violet-900/20 text-violet-300 shadow-[0_0_22px_rgba(139,92,246,0.2)]">
                                        <Icon className="h-9 w-9" strokeWidth={2.5} />
                                    </span>

                                    <h3 className="mt-4 text-base font-bold text-white">
                                        {title as string}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                        {text as string}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="pointer-events-none absolute bottom-8 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-300 to-transparent shadow-[0_0_20px_4px_rgba(167,139,250,0.55)]" />
                </section>

                <section
                    id="section-2"
                    className="relative isolate overflow-hidden bg-transparent py-20 text-white sm:py-24 lg:py-28"
                >
                    <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-violet-700/20 blur-[100px]" />
                    <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-fuchsia-700/15 blur-[100px]" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(124, 58, 237, .16),transparent_58%)]" />

                    <div className="relative mx-auto max-w-6xl px-5">
                        <header className="univers-header-transparent text-center">
    <span className="inline-flex rounded-full border border-violet-500/25 bg-violet-500/[0.08] px-3 py-1 text-[8px] font-bold uppercase tracking-[0.2em] text-violet-300">
        Des infrastructures haute performance
    </span>

    <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 !text-shadow-none sm:text-4xl lg:text-[3.2rem]">
        Nos univers d’hébergement
    </h2>

    <p className="mt-3 text-xs leading-5 text-slate-400 sm:text-sm">
        Choisissez la solution adaptée à votre projet parmi nos gammes performantes.
    </p>
</header>

                        <div className="mt-7 grid gap-3 lg:grid-cols-[1.35fr_1fr]">
                            <div className="grid gap-3">
                                <Link
                                    href={games[0][1]}
                                    className="group flex min-h-[122px] items-center gap-4 rounded-xl border border-violet-400/30 bg-gradient-to-r from-[#211746] via-[#151128] to-[#100e1c] p-4 text-white shadow-[0_0_20px_rgba(124,58,237,0.12)] transition hover:border-violet-300/70 hover:shadow-[0_0_28px_rgba(124,58,237,0.22)] sm:p-5"
                                >
                                    <span className="relative grid h-[68px] w-[68px] shrink-0 place-items-center sm:h-[78px] sm:w-[78px]">
                                        <span className="absolute inset-1 rounded-full bg-violet-500/25 blur-xl" />
                                        <img
                                            src="/images/astreon/minecraft.png"
                                            alt="Logo Minecraft"
                                            className="relative h-full w-full object-contain drop-shadow-[0_0_12px_rgba(139,92,246,0.65)]"
                                        />
                                    </span>

                                    <span className="min-w-0 flex-1">
                                        <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-violet-400">
                                            Jeux
                                        </span>
                                        <span className="mt-1 block text-sm font-black sm:text-base">
                                            Minecraft
                                        </span>
                                        <span className="mt-1 block max-w-sm text-[9px] leading-4 text-slate-400 sm:text-[10px]">
                                            Des serveurs Minecraft fiables et performants pour jouer avec vos amis et développer votre aventure en ligne.
                                        </span>
                                    </span>

                                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-violet-400/30 bg-violet-500/10 text-violet-300 transition group-hover:bg-violet-500 group-hover:text-white">
                                        →
                                    </span>
                                </Link>

                                <Link
                                    href="/services-web"
                                    className="group flex min-h-[122px] items-center gap-4 rounded-xl border border-violet-400/30 bg-gradient-to-r from-[#211746] via-[#151128] to-[#100e1c] p-4 text-white shadow-[0_0_20px_rgba(124,58,237,0.12)] transition hover:border-violet-300/70 hover:shadow-[0_0_28px_rgba(124,58,237,0.22)] sm:p-5"
                                >
                                    <span className="relative grid h-[68px] w-[68px] shrink-0 place-items-center sm:h-[78px] sm:w-[78px]">
  <span className="absolute inset-2 rounded-full bg-violet-500/50 blur-xl" />
  <img
    src="/images/astreon/weblogo.png"
    alt="Hébergement Web"
    className="relative z-10 h-9 w-9 object-contain sm:h-10 sm:w-10"
  />
</span>

                                    <span className="min-w-0 flex-1">
                                        <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-violet-400">
                                            Web
                                        </span>
                                        <span className="mt-1 block text-sm font-black sm:text-base">
                                            Hébergement Web
                                        </span>
                                        <span className="mt-1 block max-w-sm text-[9px] leading-4 text-slate-400 sm:text-[10px]">
                                            Des solutions web rapides et sécurisées pour vos projets : sites vitrines, blogs et applications.
                                        </span>
                                    </span>

                                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-violet-400/30 bg-violet-500/10 text-violet-300 transition group-hover:bg-violet-500 group-hover:text-white">
                                        →
                                    </span>
                                </Link>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    [Headphones, 'Support 24/7', 'Une équipe disponible pour vous aider.'],
                                    [ShieldCheck, 'Anti-DDoS', 'Une protection adaptée à vos services.'],
                                    [Server, 'SSD NVMe', 'Des performances rapides et fiables.'],
                                ].map(([Icon, title, description]) => (
                                    <article
                                        key={title as string}
                                        className="flex min-h-[64px] flex-col items-center rounded-xl border border-violet-400/20 bg-gradient-to-b from-[#17132a] to-[#100d1d] px-1.5 py-1.5 text-center text-white sm:min-h-[72px] sm:py-2"
                                    >
                                        <span className="grid h-6 w-6 place-items-center text-violet-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">
                                            <Icon className="h-3.5 w-3.5" />
                                        </span>
                                        <h3 className="mt-0.5 text-[7px] font-bold sm:text-[8px]">
                                            {title as string}
                                        </h3>
                                        <p className="mt-0.5 text-[6px] leading-[1.3] text-slate-400 sm:text-[7px]">
                                            {description as string}
                                        </p>
                                    </article>
                                ))}

                                <div className="relative col-span-3 flex min-h-[142px] items-center overflow-hidden rounded-xl border border-violet-400/20 bg-gradient-to-r from-[#17112d] via-[#120e21] to-[#1b1232] p-4 text-white sm:p-5">
                                    <div className="relative z-10 max-w-[68%]">
                                        <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-violet-400">
                                            À partir de
                                        </p>

                                        <h3 className="mt-1 whitespace-nowrap text-2xl font-black leading-none sm:text-3xl">
                                            1,99€
                                            <span className="ml-1 text-[9px] font-medium text-slate-400">
                                                /mois
                                            </span>
                                        </h3>

                                        <p className="mt-2 text-[8px] leading-3 text-slate-400">
                                            Des serveurs fiables, rapides et sécurisés, adaptés à vos besoins.
                                        </p>

                                        <Link
                                            href="/boutique"
                                            className="mt-3 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-[8px] font-bold text-white shadow-lg shadow-violet-900/30 transition hover:brightness-110"
                                        >
                                            Voir les offres
                                            <span aria-hidden="true">→</span>
                                        </Link>
                                    </div>

                                    <div className="pointer-events-none absolute -right-1 bottom-2 flex h-[90%] w-[34%] flex-col justify-end gap-1.5 overflow-hidden">
                                        {[0, 1, 2].map((item) => (
                                            <div
                                                key={item}
                                                className="ml-auto h-7 w-full rounded-md border border-violet-400/30 bg-gradient-to-r from-[#27204a] to-[#17132e] shadow-[0_0_14px_rgba(139,92,246,0.3)] sm:h-8"
                                            >
                                                <div className="m-2 h-1 w-6 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.9)]" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="section-3" className="bg-[#0b0817] py-24">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="text-center">
                            <h2 className="astreon-section-title text-white">
                                Les garanties <span className="text-violet-400">Astreon</span>
                            </h2>
                            <p className="astreon-section-copy text-slate-400">
                                Une plateforme pensée pour la stabilité, la sécurité et la simplicité.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {guarantees.map(([Icon, title, text]) => (
                                <article
                                    key={title as string}
                                    className="astreon-card group rounded-2xl border border-violet-500/20 bg-[#120d24] p-7 text-center shadow-[0_10px_40px_rgba(76,29,149,0.15)] transition duration-300 hover:-translate-y-1 hover:border-violet-400/50"
                                >
                                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-violet-300/40 bg-violet-500/15 text-violet-300 shadow-[0_0_28px_rgba(139,92,246,0.45)] transition group-hover:bg-violet-500/25">
                                        <Icon className="h-6 w-6" />
                                    </span>

                                    <div>
                                        <h3 className="mt-6 text-lg font-black text-white">
                                            {title as string}
                                        </h3>
                                        <p className="mt-3 text-sm leading-7 text-slate-400">
                                            {text as string}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="section-4" className="relative isolate overflow-hidden bg-[#0b0715] py-24 text-white sm:py-32 lg:py-36">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(124,58,237,.24),transparent_48%),radial-gradient(circle_at_8%_72%,rgba(91,33,182,.16),transparent_30%),radial-gradient(circle_at_92%_78%,rgba(192,38,211,.13),transparent_32%)]" />
                    <div className="pointer-events-none absolute -left-40 top-24 h-80 w-80 rounded-full border border-violet-400/15 bg-violet-700/[0.08] shadow-[0_0_150px_rgba(124,58,237,.24)]" />
                    <div className="pointer-events-none absolute -right-44 bottom-0 h-96 w-96 rounded-full border border-fuchsia-300/10 bg-fuchsia-700/[0.07] shadow-[0_0_160px_rgba(168,85,247,.2)]" />

                    <div className="relative mx-auto max-w-7xl px-6 sm:px-10 lg:px-14">
                        <div className="mx-auto max-w-3xl text-center">
                            <span className="inline-flex items-center rounded-full border border-violet-400/35 bg-violet-400/[0.09] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.24em] text-violet-200 shadow-[0_0_28px_rgba(139,92,246,.16)]">
                                Pourquoi choisir Astreon ?
                            </span>
                            <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                                Des chiffres qui parlent <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-200 bg-clip-text text-transparent">d’eux-mêmes.</span>
                            </h2>
                        </div>

                        <div className="relative mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-violet-300/15">
                            {[
                                [UsersRound, '50+', 'Clients actifs', 'Une communauté qui nous fait confiance.'],
                                [Activity, '99,9%', 'Uptime', 'Une disponibilité réseau maximale.'],
                                [Zap, '<10ms', 'Temps de réponse', 'Une réactivité pour une expérience optimale.'],
                                [Headphones, '24/7', 'Support disponible', 'Notre équipe est là, à tout moment.'],
                            ].map(([Icon, value, label, text]) => (
                                <article key={label as string} className="group relative px-4 py-7 text-center sm:px-8 lg:px-10 lg:py-4">
                                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-violet-300/25 bg-violet-500/[0.13] text-violet-200 shadow-[0_0_26px_rgba(139,92,246,.16)] transition duration-300 group-hover:border-fuchsia-300/50 group-hover:bg-fuchsia-500/15 group-hover:text-fuchsia-200">
                                        <Icon className="h-6 w-6" strokeWidth={2} />
                                    </span>
                                    <p className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl">{value as string}</p>
                                    <h3 className="mt-3 text-sm font-black uppercase tracking-[0.16em] text-violet-100">{label as string}</h3>
                                    <p className="mx-auto mt-4 max-w-[15rem] text-sm leading-6 text-slate-400">{text as string}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

               <section
    id="section-5"
    className="relative isolate overflow-hidden bg-[#0b0715] py-20 text-white sm:py-24"
>
    {/* Lueurs décoratives */}
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(124,58,237,.18),transparent_55%)]" />
    <div className="pointer-events-none absolute -left-36 bottom-0 h-64 w-64 rounded-full bg-violet-700/15 blur-3xl" />

    <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <div className="text-center">
            <div className="mx-auto mb-3 h-0.5 w-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" />

            <h2 className="text-3xl font-black sm:text-4xl">
                Ils nous font <span className="text-violet-400">confiance</span>
            </h2>

            <p className="mt-2 text-xs text-slate-400 sm:text-sm">
                Une expérience simple, rapide et adaptée aux communautés.
            </p>
        </div>

        {/* Boutons fixes : seul le bandeau des avis défile */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
            <a
                href="https://www.trustpilot.com/evaluate/astreonheberg.fr"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-3 rounded-full bg-[#00b67a] px-6 py-3 text-sm font-extrabold text-white shadow-[0_0_24px_rgba(0,182,122,0.2)] transition hover:bg-[#00a56f]"
            >
                <span className="text-xl leading-none" aria-hidden="true">
                    ★
                </span>
                Laisser un avis Trustpilot
            </a>

            <a
                href="https://www.trustpilot.com/review/astreonheberg.fr?_gl=1*1go7kbh*_gcl_au*MzIwMDQzNjE4LjE3OTE0NzQ0MzQuLS4tLjE3OTE3MTQ3ODQuMTc1MTQ1NTY3Ni4xNzkxNzE0Nzg0LjE3OTE3MTQ3ODQ.*_ga*MjEzMDQ4MDU0NS4xNzkxNDc0NDM0*_ga_11HBWMC274*czE3OTE3MTQ1NzUkbzMkZzEkdDE3OTE3MTUxMzckajU2JGwwJGgw"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
            >
                Voir les avis <span aria-hidden="true">→</span>
            </a>
        </div>

        {/*
          Remplace ces textes par les vrais avis de tes clients.
          La seconde copie permet une boucle continue sans coupure.
        */}
        {(() => {
            const reviews = [
                ['Lucas V.', 'Serveur FiveM stable et panel très simple à utiliser.'],
                ['Sarah L.', 'Installation rapide et ressources conformes à l’offre.'],
                ['Nicolas F.', 'Les outils fichiers, bases et sauvegardes sont très pratiques.'],
                ['Emma R.', 'Très bonne expérience, service rapide et équipe à l’écoute.'],
            ];

            return (
                <div className="review-marquee mt-10">
                    <div className="review-track">
                        {[0, 1].map((copy) => (
                            <div
                                key={copy}
                                className="review-group"
                                aria-hidden={copy === 1 ? 'true' : undefined}
                            >
                                {reviews.map(([name, text]) => (
                                    <article
                                        key={`${copy}-${name}`}
                                        className="review-card"
                                    >
                                        <div className="text-sm tracking-[0.15em] text-violet-400">
                                            ★★★★★
                                        </div>

                                        <h3 className="mt-2 text-base font-extrabold text-white">
                                            {name}
                                        </h3>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                            Client Astreon
                                        </p>

                                        <p className="mt-3 text-sm leading-5 text-slate-300">
                                            “{text}”
                                        </p>
                                    </article>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            );
        })()}

        {/* Barre décorative */}
        <div className="mx-auto mt-7 flex w-28 items-center justify-center gap-2">
            <span className="text-[10px] text-violet-400" aria-hidden="true">
                ←
            </span>
            <span className="h-px flex-1 bg-violet-400/30">
                <span className="block h-px w-8 bg-violet-400" />
            </span>
        </div>
    </div>

    <style>{`
        .review-marquee {
            width: 100%;
            overflow: hidden;
            direction: ltr;
            -webkit-mask-image: linear-gradient(
                to right,
                transparent,
                black 5%,
                black 95%,
                transparent
            );
            mask-image: linear-gradient(
                to right,
                transparent,
                black 5%,
                black 95%,
                transparent
            );
        }

        .review-track {
            display: flex;
            flex-direction: row;
            width: max-content;
            direction: ltr;
            will-change: transform;
            animation: astreon-reviews-scroll 28s linear infinite;
        }

        .review-group {
            display: flex;
            flex: 0 0 auto;
            flex-direction: row;
            gap: 16px;
            padding-right: 16px;
        }

        .review-card {
            box-sizing: border-box;
            width: 270px;
            min-height: 135px;
            flex: 0 0 270px;
            border: 1px solid rgba(139, 92, 246, 0.4);
            border-radius: 10px;
            background: linear-gradient(
                145deg,
                rgba(25, 18, 47, 0.95),
                rgba(13, 10, 25, 0.96)
            );
            padding: 16px;
        }

        @keyframes astreon-reviews-scroll {
            from {
                transform: translateX(0);
            }

            to {
                transform: translateX(-50%);
            }
        }

        @media (max-width: 640px) {
            .review-card {
                width: 250px;
                flex-basis: 250px;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .review-track {
                animation: none;
            }
        }
    `}</style>
</section>
            </main>
        </PublicLayout>
    );
}