import PublicLayout from '@/layouts/PublicLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { CircleCheckBig, Cpu, HardDrive, Users } from 'lucide-react';

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

type ArkEdition = {
    value: 'survival-evolved' | 'survival-ascended';
    label: string;
    description: string;
};

type MinecraftEdition = 'java' | 'bedrock';

type Props = {
    product: Product;
    catalogSlug?: string;
    arkEditions?: ArkEdition[];
};

const euro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

const planLogos: Record<string, string> = {
    coal: '/images/astreon/Coal.png',
    charbon: '/images/astreon/Coal.png',
    iron: '/images/astreon/Iron_Ingot.png',
    fer: '/images/astreon/Iron_Ingot.png',
    diamond: '/images/astreon/Diamond.png',
    diamant: '/images/astreon/Diamond.png',
    netherite: '/images/astreon/Nether.png',
    dragon: '/images/astreon/dragon.png',
};

function getPlanLogo(plan: Plan): string | null {
    const name = `${plan.name} ${plan.slug} ${plan.sku}`.toLowerCase();

    return (
        Object.entries(planLogos).find(([key]) => name.includes(key))?.[1] ??
        null
    );
}

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

export default function StoreShow({
    product,
    catalogSlug,
    arkEditions = [],
}: Props) {
    const isArk = catalogSlug === 'ark';
    const isMinecraft =
        catalogSlug?.toLowerCase().includes('minecraft') ||
        product.slug.toLowerCase().includes('minecraft');

    const [arkEdition, setArkEdition] = useState<ArkEdition['value'] | ''>(
        '',
    );

    const [mcEdition, setMcEdition] = useState<MinecraftEdition>(
        product.slug === 'minecraft-bedrock' ? 'bedrock' : 'java',
    );

    useEffect(() => {
        setMcEdition(product.slug === 'minecraft-bedrock' ? 'bedrock' : 'java');
    }, [product.slug]);

    // Toutes les offres sont affichées : l'édition est choisie au paiement.
const visiblePlans = product.plans;

    return (
        <PublicLayout>
            <Head title={`${product.name} — AstreonHeberg`} />

            <style>{`
                /* La page porte l'image Minecraft; toute la chaîne jusqu'à la
                   grille reste sans peinture ni effet de composition. */
                body main:has(.store-plans-grid),
                body main:has(.store-plans-grid) > .store-plans-grid,
                body main:has(.store-plans-grid) > section,
                body main > section.store-plans-grid,
                body main .store-plans-grid,
                body main .store-plans-grid::before,
                body main .store-plans-grid::after,
                body main .store-plans-grid > *:not(.store-plan-card) {
                    background: transparent !important;
                    background-color: transparent !important;
                    background-image: none !important;
                    box-shadow: none !important;
                    filter: none !important;
                    backdrop-filter: none !important;
                    -webkit-backdrop-filter: none !important;
                }

                body main:has(.store-plans-grid),
                body main > section.store-plans-grid {
                    border: 0 !important;
                    border-radius: 0 !important;
                    overflow: visible !important;
                    background-clip: border-box !important;
                }

                /* Le seul fond sombre de cette zone est celui de chaque carte.
                   Pas de backdrop-filter: il ne doit pas fabriquer un rectangle
                   de composition derrière les coins arrondis. */
                body main .store-plans-grid > article.store-plan-card {
                    background: linear-gradient(
                        145deg,
                        rgba(23, 16, 59, .88),
                        rgba(11, 14, 39, .92)
                    ) !important;
                    background-color: rgba(11, 14, 39, .92) !important;
                    background-clip: padding-box !important;
                    border-radius: 1rem !important;
                    overflow: visible !important;
                    filter: none !important;
                    backdrop-filter: none !important;
                    -webkit-backdrop-filter: none !important;
                }

                body main .store-plans-grid .plan-head,
                body main .store-plans-grid .plan-head * {
                    background: transparent !important;
                    background-color: transparent !important;
                    background-image: none !important;
                    box-shadow: none !important;
                    backdrop-filter: none !important;
                    -webkit-backdrop-filter: none !important;
                }

                body main .store-plans-grid .plan-logo {
                    background: transparent !important;
                    background-color: transparent !important;
                    background-image: none !important;
                    border: none !important;
                    border-radius: 0 !important;
                    padding: 0 !important;
                    box-shadow: none !important;
                    mix-blend-mode: normal !important;
                }

                /* Switch Java / Bedrock — pilule arrondie */
                .mc-edition-switch {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    margin: 1.25rem auto 0;
                    padding: 4px;
                    border-radius: 999px;
                    background: rgba(14, 16, 40, 0.85);
                    border: 1px solid rgba(139, 92, 246, 0.35);
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35),
                        inset 0 1px 0 rgba(255, 255, 255, 0.04);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                }

                .mc-edition-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    padding: 0.6rem 1.6rem;
                    border: none;
                    border-radius: 999px;
                    background: transparent;
                    color: #b8b3d6;
                    font-size: 0.85rem;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                    cursor: pointer;
                    transition: background 0.25s ease, color 0.25s ease,
                        box-shadow 0.25s ease, transform 0.15s ease;
                }

                .mc-edition-btn:hover {
                    color: #ffffff;
                }

                .mc-edition-btn:active {
                    transform: scale(0.97);
                }

                .mc-edition-btn[aria-pressed="true"] {
                    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
                    color: #ffffff;
                    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.45);
                }

                .mc-edition-btn:focus-visible {
                    outline: 2px solid #a78bfa;
                    outline-offset: 3px;
                }
            `}</style>

            <div
                className={`min-h-screen text-white ${
                    isMinecraft
                        ? 'bg-[#07091c] bg-cover bg-center bg-no-repeat'
                        : 'bg-[#07091c]'
                }`}
                style={
                    isMinecraft
                        ? {
                              backgroundImage:
                                  "linear-gradient(rgba(5, 7, 22, 0.62), rgba(5, 7, 22, 0.82)), url('/images/astreon/minecraft-background.webp')",
                          }
                        : undefined
                }
            >
                <main className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
                    <div className="pointer-events-none absolute -left-40 top-10 h-80 w-80 rounded-full bg-violet-700/15 blur-[100px]" />
                    <div className="pointer-events-none absolute -right-40 top-32 h-96 w-96 rounded-full bg-blue-700/10 blur-[120px]" />

                    {isMinecraft && (
                        <>
                            <img
                                src="/images/astreon/minecraft.png"
                                alt=""
                                aria-hidden="true"
                                className="pointer-events-none absolute left-2 top-8 z-0 hidden w-28 object-contain drop-shadow-[0_0_22px_rgba(34,197,94,0.45)] sm:block lg:left-4 lg:top-10 lg:w-36"
                            />

                            <img
                                src="/images/astreon/dragon.png"
                                alt=""
                                aria-hidden="true"
                                className="pointer-events-none fixed right-[-18px] top-16 z-50 hidden w-28 object-contain drop-shadow-[0_0_26px_rgba(124,58,237,0.7)] sm:block sm:w-36 lg:right-[-18px] lg:top-20 lg:w-44"
                            />
                        </>
                    )}

                    <section
                        className="univers-header-transparent relative z-10 mx-auto max-w-3xl text-center"
                        style={{
                            background: 'transparent',
                            backgroundColor: 'transparent',
                            backgroundImage: 'none',
                            boxShadow: 'none',
                            backdropFilter: 'none',
                        }}
                    >
                        <p className="bg-transparent text-xs font-black uppercase tracking-[0.45em] text-violet-400">
                            Serveurs gaming
                        </p>

                        <h1 className="mt-4 bg-transparent text-4xl font-black tracking-tight sm:text-6xl">
                            {isMinecraft ? (
                                <>
                                    Minecraft{' '}
                                    <span className="text-white">Java &</span>{' '}
                                    <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                                        Bedrock
                                    </span>
                                </>
                            ) : (
                                <span className="bg-gradient-to-r from-white to-violet-300 bg-clip-text text-transparent">
                                    {product.name}
                                </span>
                            )}
                        </h1>

                        <p className="mx-auto mt-4 max-w-2xl bg-transparent text-sm leading-6 text-slate-400 sm:text-base">
                            {product.short_description ??
                                product.description ??
                                'Choisissez l’offre adaptée à votre serveur.'}
                        </p>

                        {isMinecraft && (
                            <>
                                <p className="mt-3 bg-transparent text-xs text-slate-500">
                                    Vanilla, Paper, Forge, Fabric, plugins et
                                    modpacks.
                                </p>
                                <p className="mt-3 bg-transparent text-xs text-violet-200">
                                    ☕ Java&nbsp;&nbsp; · &nbsp;&nbsp;🌐
                                    Bedrock&nbsp;&nbsp; · &nbsp;&nbsp;🎮
                                    Cross-play
                                </p>
                            </>
                        )}

                        <p className="mt-5 bg-transparent text-xs font-semibold text-violet-200">
                            ✦ Performances premium · Protection anti-DDoS ·
                            Support réactif ✦
                        </p>

                        {isMinecraft && (
                            <div
                                className="mc-edition-switch"
                                role="group"
                                aria-label="Choisir l'édition Minecraft"
                            >
                                <button
                                    type="button"
                                    className="mc-edition-btn"
                                    aria-pressed={mcEdition === 'java'}
                                    onClick={() => setMcEdition('java')}
                                >
                                    ☕ Java
                                </button>
                                <button
                                    type="button"
                                    className="mc-edition-btn"
                                    aria-pressed={mcEdition === 'bedrock'}
                                    onClick={() => setMcEdition('bedrock')}
                                >
                                    🌐 Bedrock
                                </button>
                            </div>
                        )}
                    </section>

                    {isArk && (
                        <section className="relative mx-auto mt-10 max-w-4xl rounded-2xl border border-violet-400/25 bg-[#0e1028]/90 p-6 sm:p-8">
                            <p className="text-xs font-black uppercase tracking-[0.25em] text-violet-300">
                                Étape obligatoire
                            </p>

                            <h2 className="mt-3 text-2xl font-black">
                                Choisissez votre version de ARK
                            </h2>

                            <p className="mt-2 text-sm text-slate-400">
                                Votre sélection détermine le bon Egg
                                Pterodactyl lors de la création du serveur.
                            </p>

                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                {arkEditions.map((edition) => {
                                    const selected =
                                        arkEdition === edition.value;

                                    return (
                                        <button
                                            key={edition.value}
                                            type="button"
                                            aria-pressed={selected}
                                            onClick={() =>
                                                setArkEdition(edition.value)
                                            }
                                            className={`rounded-xl border p-5 text-left transition ${
                                                selected
                                                    ? 'border-violet-400 bg-violet-500/15 ring-2 ring-violet-500/30'
                                                    : 'border-white/10 bg-[#090b1d] hover:border-violet-400/50'
                                            }`}
                                        >
                                            <span className="flex items-center justify-between gap-4 font-bold">
                                                {edition.label}
                                                {selected && (
                                                    <CircleCheckBig className="h-5 w-5 text-violet-300" />
                                                )}
                                            </span>

                                            <span className="mt-2 block text-sm leading-6 text-slate-400">
                                                {edition.description}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {!arkEdition && (
                                <p className="mt-4 text-sm font-semibold text-amber-300">
                                    Sélectionnez une version avant d’ajouter
                                    une offre au panier.
                                </p>
                            )}
                        </section>
                    )}

                    <section className="store-plans-grid relative mt-12 grid items-stretch gap-5 bg-transparent sm:grid-cols-2 xl:grid-cols-4">
                        {visiblePlans.map((plan) => {
                            const unavailable =
                                plan.stock_tracking &&
                                (plan.stock_quantity ?? 0) <= 0;
                            const logo = getPlanLogo(plan);

                            return (
                                <article
                                    key={plan.id}
                                    className={`store-plan-card relative flex flex-col rounded-2xl border bg-transparent p-5 transition duration-200 hover:-translate-y-1 ${
                                        plan.is_popular
                                            ? 'border-violet-500 shadow-[0_0_35px_rgba(124,58,237,0.22)]'
                                            : 'border-indigo-900/70 hover:border-violet-500/60'
                                    }`}
                                >
                                    {plan.is_popular && (
                                        <span className="absolute -top-3 right-4 rounded-full border border-violet-300/30 bg-violet-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-violet-900/50">
                                            Populaire
                                        </span>
                                    )}

                                    <div className="plan-head flex min-h-12 items-center gap-3">
                                        {logo && (
                                            <img
                                                src={logo}
                                                alt=""
                                                className="plan-logo h-10 w-10 object-contain drop-shadow-[0_0_10px_rgba(139,92,246,0.35)]"
                                            />
                                        )}

                                        <div>
                                            <h2 className="text-xl font-black tracking-wide">
                                                {plan.name}
                                            </h2>
                                            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-violet-300">
                                                {plan.sku}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 border-b border-white/10 pb-4">
                                        <span className="text-3xl font-black">
                                            {euro.format(
                                                plan.price_monthly_cents / 100,
                                            )}
                                        </span>
                                        <span className="ml-1 text-xs text-slate-400">
                                            / mois
                                        </span>

                                        {plan.setup_fee_cents > 0 && (
                                            <p className="mt-1 text-[11px] text-slate-500">
                                                +{' '}
                                                {euro.format(
                                                    plan.setup_fee_cents / 100,
                                                )}{' '}
                                                de mise en service
                                            </p>
                                        )}
                                    </div>

                                    <dl className="mt-5 space-y-3 text-xs">
                                        {plan.ram_mb !== null && (
                                            <div className="flex items-center justify-between gap-3">
                                                <dt className="flex items-center gap-2 text-slate-400">
                                                    <HardDrive className="h-3.5 w-3.5 text-violet-400" />
                                                    RAM
                                                </dt>
                                                <dd className="font-bold">
                                                    {Math.round(
                                                        plan.ram_mb / 1024,
                                                    )}{' '}
                                                    Go
                                                </dd>
                                            </div>
                                        )}

                                        {plan.disk_gb !== null && (
                                            <div className="flex items-center justify-between gap-3">
                                                <dt className="flex items-center gap-2 text-slate-400">
                                                    <HardDrive className="h-3.5 w-3.5 text-violet-400" />
                                                    Stockage
                                                </dt>
                                                <dd className="font-bold">
                                                    {plan.disk_gb} Go NVMe
                                                </dd>
                                            </div>
                                        )}

                                        {(plan.cpu_percent !== null ||
                                            plan.cpu_cores !== null) && (
                                            <div className="flex items-center justify-between gap-3">
                                                <dt className="flex items-center gap-2 text-slate-400">
                                                    <Cpu className="h-3.5 w-3.5 text-violet-400" />
                                                    CPU
                                                </dt>
                                                <dd className="font-bold">
                                                    {plan.cpu_percent !== null
                                                        ? `${plan.cpu_percent} %`
                                                        : `${plan.cpu_cores} cœur(s)`}
                                                </dd>
                                            </div>
                                        )}

                                        {plan.player_slots !== null && (
                                            <div className="flex items-center justify-between gap-3">
                                                <dt className="flex items-center gap-2 text-slate-400">
                                                    <Users className="h-3.5 w-3.5 text-violet-400" />
                                                    Joueurs
                                                </dt>
                                                <dd className="font-bold">
                                                    {plan.player_slots}
                                                </dd>
                                            </div>
                                        )}

                                        {plan.databases_limit !== null && (
                                            <div className="flex justify-between gap-3">
                                                <dt className="text-slate-400">
                                                    Bases de données
                                                </dt>
                                                <dd className="font-bold">
                                                    {plan.databases_limit}
                                                </dd>
                                            </div>
                                        )}

                                        {plan.backups_limit !== null && (
                                            <div className="flex justify-between gap-3">
                                                <dt className="text-slate-400">
                                                    Sauvegardes
                                                </dt>
                                                <dd className="font-bold">
                                                    {plan.backups_limit}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>

                                    {plan.features &&
                                        plan.features.length > 0 && (
                                            <ul className="mt-5 flex-1 space-y-2 border-t border-white/10 pt-4 text-[11px] leading-4 text-slate-300">
                                                {plan.features.map(
                                                    (feature) => (
                                                        <li
                                                            key={feature}
                                                            className="flex gap-2"
                                                        >
                                                            <span className="font-black text-violet-400">
                                                                ✓
                                                            </span>
                                                            <span>
                                                                {feature}
                                                            </span>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        )}

                                    {plan.specifications &&
                                        Object.keys(plan.specifications)
                                            .length > 0 && (
                                            <details className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
                                                <summary className="cursor-pointer text-xs font-bold text-slate-300">
                                                    Caractéristiques avancées
                                                </summary>
                                                <dl className="mt-3 space-y-2 text-[10px]">
                                                    {Object.entries(
                                                        plan.specifications,
                                                    ).map(([key, value]) => (
                                                        <div
                                                            key={key}
                                                            className="flex justify-between gap-3"
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
                                        disabled={
                                            unavailable ||
                                            (isArk && !arkEdition)
                                        }
                                        onClick={() => {
                                            router.post(`/panier/${plan.id}`, {
                                                quantity: 1,
                                                ark_edition: isArk
                                                    ? arkEdition
                                                    : null,
                                                minecraft_edition: isMinecraft
                                                    ? mcEdition
                                                    : null,
                                            });
                                        }}
                                        className="mt-5 w-full rounded-lg bg-gradient-to-r from-violet-700 to-violet-500 px-4 py-3 text-xs font-black text-white shadow-lg shadow-violet-950/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {unavailable
                                            ? 'Rupture de stock'
                                            : isArk && !arkEdition
                                              ? 'Choisissez une version'
                                              : '🛒 Ajouter au panier'}
                                    </button>
                                </article>
                            );
                        })}
                    </section>

                    {visiblePlans.length === 0 && (
                        <div className="relative mt-10 rounded-2xl border border-indigo-900/70 bg-[#0b0e27] p-10 text-center text-slate-400">
                            Aucune offre n’est actuellement disponible pour
                            ce produit.
                        </div>
                    )}
                </main>
            </div>
        </PublicLayout>
    );
}