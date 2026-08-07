import { Link, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    Cloud,
    Gamepad2,
    Globe2,
    Menu,
    Server,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AstreonLogo from './AstreonLogo';

type MenuKey = 'gaming' | 'web' | 'other' | null;

const menus = {
    gaming: [
        ['FiveM', 'Serveurs RP performants et protégés', Gamepad2, '/boutique/fivem'],
        ['Minecraft Java', 'Serveurs Java avec panel complet', Gamepad2, '/boutique/minecraft-java'],
        ['Minecraft Bedrock', 'Serveurs Bedrock fluides et automatisés', Gamepad2, '/boutique/minecraft-bedrock'],
        ['ARK', 'Survival Evolved ou Survival Ascended', Gamepad2, '/boutique/ark'],
        ['Palworld', 'Instances rapides et automatisées', Gamepad2, '/boutique/palworld'],
    ],
    web: [
        ['Hébergement Web', 'Sites, boutiques et applications', Globe2, '/boutique/hebergement-web'],
    ],
    other: [
        ['Nous contacter', 'Une question avant de commander ?', Globe2, 'https://discord.gg/3fZ6xye97x'],
        ['À propos', 'Découvrez Astreon et notre vision', Cloud, '/a-propos'],
        ['Discord', 'Rejoignez notre communauté', Gamepad2, 'https://discord.gg/3fZ6xye97x'],
        ['État des services', 'Consultez la disponibilité en direct', Server, '/status'],
    ],
} as const;

const menuLabels: Record<Exclude<MenuKey, null>, string> = {
    gaming: 'Service Gaming',
    web: 'Service Web',
    other: 'Autres',
};

export default function PublicHeader() {
    const { auth } = usePage<{
        auth?: { user?: { name: string } | null };
    }>().props;

    const [openMenu, setOpenMenu] = useState<MenuKey>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileSection, setMobileSection] = useState<MenuKey>(null);
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const close = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpenMenu(null);
            }
        };

        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    function closeMobile(): void {
        setMobileOpen(false);
        setMobileSection(null);
    }

    return (
        <header
            ref={ref}
            className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl"
        >
            <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:h-[86px] sm:px-5 lg:px-8">
                <AstreonLogo />

                <nav className="hidden items-center gap-1 lg:flex">
                    <Link href="/" className="astreon-nav-link">Accueil</Link>
                    <Link href="/boutique/categorie/vps" className="astreon-nav-link">VPS</Link>

                    {([
                        ['gaming', 'Service Gaming'],
                        ['web', 'Service Web'],
                        ['other', 'Autres'],
                    ] as const).map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setOpenMenu(openMenu === key ? null : key)}
                            className={`astreon-nav-link inline-flex items-center gap-1 ${
                                openMenu === key ? 'text-orange-600' : ''
                            }`}
                            aria-expanded={openMenu === key}
                        >
                            {label}
                            <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                    openMenu === key ? 'rotate-180' : ''
                                }`}
                            />
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                        href={auth?.user ? '/client' : '/login'}
                        className="astreon-primary-button hidden sm:inline-flex"
                    >
                        Espace client
                    </Link>

                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm lg:hidden"
                        aria-label="Ouvrir le menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {openMenu && (
                <div className="absolute left-1/2 top-[75px] hidden w-[min(680px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl lg:block">
                    <div className="grid grid-cols-2 gap-2">
                        {menus[openMenu].map(([title, description, Icon, href]) => {
                            const external = href.startsWith('http');
                            const content = (
                                <>
                                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-100 text-orange-600">
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block font-black text-slate-900 group-hover:text-orange-600">
                                            {title}
                                        </span>
                                        <span className="mt-1 block text-sm text-slate-500">
                                            {description}
                                        </span>
                                    </span>
                                </>
                            );

                            return external ? (
                                <a
                                    key={title}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setOpenMenu(null)}
                                    className="group flex gap-4 rounded-xl p-4 transition hover:bg-orange-50"
                                >
                                    {content}
                                </a>
                            ) : (
                                <Link
                                    key={title}
                                    href={href}
                                    onClick={() => setOpenMenu(null)}
                                    className="group flex gap-4 rounded-xl p-4 transition hover:bg-orange-50"
                                >
                                    {content}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {mobileOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <button
                        type="button"
                        onClick={closeMobile}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        aria-label="Fermer le menu"
                    />

                    <aside className="absolute inset-y-0 right-0 flex w-[min(92vw,390px)] flex-col bg-white shadow-2xl">
                        <div className="flex h-[72px] items-center justify-between border-b border-slate-200 px-5">
                            <AstreonLogo compact />
                            <button
                                type="button"
                                onClick={closeMobile}
                                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200"
                                aria-label="Fermer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-4 py-4">
                            <Link href="/" onClick={closeMobile} className="astreon-mobile-link">
                                Accueil
                            </Link>
                            <Link
                                href="/boutique/categorie/vps"
                                onClick={closeMobile}
                                className="astreon-mobile-link"
                            >
                                VPS
                            </Link>

                            {(['gaming', 'web', 'other'] as const).map((key) => (
                                <div key={key} className="border-b border-slate-100 py-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMobileSection(
                                                mobileSection === key ? null : key,
                                            )
                                        }
                                        className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm font-black text-slate-800 hover:bg-slate-50"
                                        aria-expanded={mobileSection === key}
                                    >
                                        {menuLabels[key]}
                                        <ChevronDown
                                            className={`h-4 w-4 transition-transform ${
                                                mobileSection === key ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>

                                    {mobileSection === key && (
                                        <div className="space-y-1 pb-2 pl-3">
                                            {menus[key].map(([title, , Icon, href]) => {
                                                const external = href.startsWith('http');
                                                const classes =
                                                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-orange-50 hover:text-orange-600';

                                                return external ? (
                                                    <a
                                                        key={title}
                                                        href={href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={closeMobile}
                                                        className={classes}
                                                    >
                                                        <Icon className="h-4 w-4" />
                                                        {title}
                                                    </a>
                                                ) : (
                                                    <Link
                                                        key={title}
                                                        href={href}
                                                        onClick={closeMobile}
                                                        className={classes}
                                                    >
                                                        <Icon className="h-4 w-4" />
                                                        {title}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        <div className="border-t border-slate-200 p-4">
                            <Link
                                href={auth?.user ? '/client' : '/login'}
                                onClick={closeMobile}
                                className="astreon-primary-button flex w-full justify-center py-3.5"
                            >
                                {auth?.user ? 'Ouvrir mon espace client' : 'Se connecter'}
                            </Link>

                            {!auth?.user && (
                                <Link
                                    href="/register"
                                    onClick={closeMobile}
                                    className="mt-2 flex w-full justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700"
                                >
                                    Créer un compte
                                </Link>
                            )}
                        </div>
                    </aside>
                </div>
            )}
        </header>
    );
}
