import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    
    ChevronDown,
    ContactRound,
    CreditCard,
    FileText,
    HelpCircle,
    History,
    Home,
    KeyRound,
    LogOut,
    Mail,
    Menu,
    Package,
    Search,
    ShieldCheck,
    ShoppingCart,
    User,
    UserCog,
    Users,
    WalletCards,
    X,
} from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import AstreonLogo from '@/components/astreon/AstreonLogo';
import NotificationBell from '@/components/notifications/notification-bell';

type SharedProps = {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
};

type Props = {
    children: ReactNode;
    title: string;
    description?: string;
};

const links = [
    ['Accueil', '/client', Home],
    ['Mes services', '/client/services', Package],
    ['Mes commandes', '/client/orders', FileText],
    ['Portefeuille', '/client/wallet', WalletCards],
    ['Boutique', '/boutique', ShoppingCart],
] as const;

const accountLinks = [
    ['Mes informations', '/client/account', UserCog],
    ['Gestion des utilisateurs', '/client/account/members', Users],
    ['Modes de paiement', '/client/account/payment-methods', CreditCard],
    ['Mon portefeuille', '/client/wallet', WalletCards],
    ['Gestion des contacts', '/client/account/contacts', ContactRound],
    ['Historique des courriels', '/client/account/emails', Mail],
] as const;

const securityLinks = [
    ['Votre profil', '/client/account', User],
    ['Modifier le mot de passe', '/client/account/password', KeyRound],
    ['Paramètres de sécurité', '/client/account/security', ShieldCheck],
] as const;

export default function ClientLayout({
    children,
    title,
    description,
}: Props) {
    const page = usePage<SharedProps>();
    const user = page.props.auth.user;
    const path = new URL(page.url, window.location.origin).pathname;

    const [mobileOpen, setMobileOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);

    const accountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const close = (event: MouseEvent) => {
            if (
                accountRef.current
                && !accountRef.current.contains(event.target as Node)
            ) {
                setAccountOpen(false);
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

    function isActive(href: string): boolean {
        return href === '/client'
            ? path === href
            : path === href || path.startsWith(`${href}/`);
    }

    return (
        <>
            <Head title={`${title} — Astreon`} />

            <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
                <div className="border-b border-slate-200 bg-[#eef1f5]">
                    <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-5 text-xs text-slate-500">
                        

                        <span className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-orange-500" />
                            {user?.name ?? 'Compte'}
                        </span>
                    </div>
                </div>

                <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
                    <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-2 px-3 sm:h-[78px] sm:px-5">
                        <AstreonLogo compact />

                        <nav className="hidden items-center gap-1 lg:flex">
                            {links.map(([label, href, Icon]) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                                        isActive(href)
                                            ? 'bg-orange-50 text-orange-600'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </Link>
                            ))}

                            <Link
                                href="/client/support"
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                                    path.startsWith('/client/support')
                                        ? 'bg-orange-50 text-orange-600'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                                }`}
                            >
                                <HelpCircle className="h-4 w-4" />
                                Assistance
                            </Link>
                        </nav>

                        <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
                            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 xl:flex">
                                <Search className="h-4 w-4 text-slate-400" />
                                <input
                                    className="w-28 bg-transparent text-sm outline-none"
                                    placeholder="Recherche..."
                                />
                            </div>

                                                        <NotificationBell variant="client" />
<Link
                                href="/panier"
                                aria-label="Ouvrir le panier"
                                className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full border transition sm:h-12 sm:w-12 ${
                                    path === '/panier' || path === '/checkout'
                                        ? 'border-purple-400/60 bg-purple-500/20 text-purple-200'
                                        : 'border-purple-500/25 bg-[#100a1e] text-slate-300 hover:border-purple-400/60 hover:text-white'
                                }`}
                            >
                                <ShoppingCart className="h-5 w-5" />
                            </Link>

                            <div ref={accountRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => setAccountOpen((open) => !open)}
                                    className="astreon-primary-button hidden px-4 py-3 md:inline-flex xl:px-5"
                                >
                                    Bonjour, {user?.name.split(' ')[0] ?? 'Client'} !
                                    <ChevronDown
                                        className={`h-4 w-4 transition-transform ${
                                            accountOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {accountOpen && (
                                    <div className="fixed inset-x-3 top-[116px] max-h-[calc(100dvh-132px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-80 sm:max-h-[75vh]">
                                        <div className="border-b border-slate-100 px-5 py-4">
                                            <p className="font-black text-slate-950">
                                                {user?.name}
                                            </p>
                                            <p className="mt-1 truncate text-sm text-slate-500">
                                                {user?.email}
                                            </p>
                                        </div>

                                        <div className="p-2">
                                            <p className="px-3 pb-2 pt-1 text-[10px] font-black uppercase tracking-[.18em] text-slate-400">
                                                Compte
                                            </p>

                                            {accountLinks.map(([label, href, Icon]) => (
                                                <Link
                                                    key={href}
                                                    href={href}
                                                    onClick={() => setAccountOpen(false)}
                                                    className={`astreon-dropdown-link ${
                                                        isActive(href)
                                                            ? 'bg-orange-50 text-orange-600'
                                                            : ''
                                                    }`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {label}
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="border-t border-slate-100 p-2">
                                            <p className="px-3 pb-2 pt-1 text-[10px] font-black uppercase tracking-[.18em] text-slate-400">
                                                Sécurité
                                            </p>

                                            {securityLinks.map(([label, href, Icon]) => (
                                                <Link
                                                    key={`${label}-${href}`}
                                                    href={href}
                                                    onClick={() => setAccountOpen(false)}
                                                    className={`astreon-dropdown-link ${
                                                        isActive(href)
                                                            ? 'bg-orange-50 text-orange-600'
                                                            : ''
                                                    }`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {label}
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="border-t border-slate-100 p-2">
                                            <button
                                                type="button"
                                                onClick={() => router.post('/logout')}
                                                className="astreon-dropdown-link w-full text-left text-red-600 hover:bg-red-50"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Se déconnecter
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setMobileOpen((open) => !open)}
                                className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 lg:hidden"
                            >
                                {mobileOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {mobileOpen && (
                        <div className="fixed inset-x-0 bottom-0 top-[104px] z-40 overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 shadow-2xl lg:hidden">
                            <div className="mx-auto max-w-lg space-y-1 pb-8">
                                {links.map(([label, href]) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setMobileOpen(false)}
                                        className="astreon-mobile-link"
                                    >
                                        {label}
                                    </Link>
                                ))}

                                <Link
                                    href="/client/support"
                                    onClick={() => setMobileOpen(false)}
                                    className="astreon-mobile-link"
                                >
                                    Assistance
                                </Link>

                                <div className="my-3 border-t border-slate-200" />

                                {accountLinks.map(([label, href]) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setMobileOpen(false)}
                                        className="astreon-mobile-link"
                                    >
                                        {label}
                                    </Link>
                                ))}

                                <Link
                                    href="/client/account/password"
                                    onClick={() => setMobileOpen(false)}
                                    className="astreon-mobile-link"
                                >
                                    Modifier le mot de passe
                                </Link>

                                <Link
                                    href="/client/account/security"
                                    onClick={() => setMobileOpen(false)}
                                    className="astreon-mobile-link"
                                >
                                    Paramètres de sécurité
                                </Link>
                            </div>
                        </div>
                    )}
                </header>

                <div className="border-b border-slate-200 bg-[#f7f8fb]">
                    <div className="mx-auto max-w-6xl px-5 py-3 text-xs text-slate-500">
                        <Link href="/client" className="text-orange-500">
                            Accueil
                        </Link>
                        <span className="mx-2">/</span>
                        {title}
                    </div>
                </div>

                <main className="mx-auto max-w-6xl px-3 py-5 sm:px-5 sm:py-7">
                    <div className="mb-7">
                        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                            {title}
                        </h1>

                        {description && (
                            <p className="mt-2 text-sm text-slate-500">
                                {description}
                            </p>
                        )}
                    </div>

                    {children}
                </main>

                <footer className="mt-16 bg-[#3e3e3e] text-white">
                    <div className="mx-auto flex min-h-44 max-w-6xl flex-col items-center justify-between gap-5 px-6 py-10 text-sm sm:flex-row">
                        <div className="flex gap-6">
                            <Link href="/client/support">Nous contacter</Link>
                            <Link href="/">Conditions d’utilisation</Link>
                        </div>

                        <p className="text-xs text-slate-300">
                            Copyright © 2026 Astreon. Tous droits réservés.
                        </p>

                        <span aria-hidden="true">●</span>
                    </div>
                </footer>
            </div>
        </>
    );
}
