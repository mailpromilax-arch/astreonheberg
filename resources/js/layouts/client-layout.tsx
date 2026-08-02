import { Head, Link, router, usePage } from '@inertiajs/react';
import { Bell, ChevronDown, FileText, HelpCircle, Home, Menu, Package, Search, Settings, ShoppingCart, User, X } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import AstreonLogo from '@/components/astreon/AstreonLogo';

type SharedProps = { auth: { user: { id: number; name: string; email: string } | null } };
type Props = { children: ReactNode; title: string; description?: string };

const links = [
    ['Accueil', '/client', Home],
    ['Mes services', '/client/services', Package],
    ['Mes commandes', '/client/orders', FileText],
    ['Boutique', '/boutique', ShoppingCart],
] as const;

export default function ClientLayout({ children, title, description }: Props) {
    const page = usePage<SharedProps>();
    const user = page.props.auth.user;
    const path = new URL(page.url, window.location.origin).pathname;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const close = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setAccountOpen(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    return (
        <>
            <Head title={`${title} — Astreon`} />
            <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
                <div className="border-b border-slate-200 bg-[#eef1f5]">
                    <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-5 text-xs text-slate-500">
                        <span className="relative"><Bell className="h-4 w-4" /><span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-orange-500 text-[9px] text-white">1</span></span>
                        <span className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-orange-500" />{user?.name ?? 'Compte'}</span>
                    </div>
                </div>

                <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
                    <div className="mx-auto flex h-[78px] max-w-6xl items-center justify-between px-5">
                        <AstreonLogo compact />
                        <nav className="hidden items-center gap-1 lg:flex">
                            {links.map(([label, href, Icon]) => <Link key={href} href={href} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${path === href || (href !== '/client' && path.startsWith(href)) ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}><Icon className="h-4 w-4" />{label}</Link>)}
                            <Link href="/client" className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"><HelpCircle className="h-4 w-4" />Assistance</Link>
                        </nav>

                        <div className="flex items-center gap-3">
                            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 xl:flex"><Search className="h-4 w-4 text-slate-400" /><input className="w-28 bg-transparent text-sm outline-none" placeholder="Recherche..." /></div>
                            <Link
                                href="/panier"
                                aria-label="Ouvrir le panier"
                                className={`relative grid h-12 w-12 place-items-center rounded-full border transition ${path === '/panier' || path === '/checkout' ? 'border-purple-400/60 bg-purple-500/20 text-purple-200' : 'border-purple-500/25 bg-[#100a1e] text-slate-300 hover:border-purple-400/60 hover:text-white'}`}
                            >
                                <ShoppingCart className="h-5 w-5" />
                            </Link>
                            <div ref={ref} className="relative">
                                <button type="button" onClick={() => setAccountOpen(!accountOpen)} className="astreon-primary-button px-5 py-3">Bonjour, {user?.name.split(' ')[0] ?? 'Client'} ! <ChevronDown className="h-4 w-4" /></button>
                                {accountOpen && <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                                    <div className="border-b border-slate-100 px-4 py-4"><p className="font-black">{user?.name}</p><p className="mt-1 truncate text-sm text-slate-500">{user?.email}</p></div>
                                    <Link href="/settings/profile" className="astreon-dropdown-link"><User className="h-4 w-4" />Votre profil</Link>
                                    <Link href="/settings/security" className="astreon-dropdown-link"><Settings className="h-4 w-4" />Paramètres de sécurité</Link>
                                    <button type="button" onClick={() => router.post('/logout')} className="astreon-dropdown-link w-full text-left text-red-600">Se déconnecter</button>
                                </div>}
                            </div>
                            <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 lg:hidden">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
                        </div>
                    </div>
                    {mobileOpen && <div className="border-t border-slate-200 px-5 py-4 lg:hidden">{links.map(([label, href]) => <Link key={href} href={href} className="astreon-mobile-link">{label}</Link>)}</div>}
                </header>

                <div className="border-b border-slate-200 bg-[#f7f8fb]"><div className="mx-auto max-w-6xl px-5 py-3 text-xs text-slate-500"><Link href="/client" className="text-orange-500">Accueil</Link><span className="mx-2">/</span>{title}</div></div>

                <main className="mx-auto max-w-6xl px-5 py-7">
                    <div className="mb-7"><h1 className="text-3xl font-black tracking-tight">{title}</h1>{description && <p className="mt-2 text-sm text-slate-500">{description}</p>}</div>
                    {children}
                </main>

                <footer className="mt-16 bg-[#3e3e3e] text-white"><div className="mx-auto flex min-h-44 max-w-6xl flex-col items-center justify-between gap-5 px-6 py-10 text-sm sm:flex-row"><div className="flex gap-6"><Link href="/client">Nous contacter</Link><Link href="/">Conditions d’utilisation</Link></div><p className="text-xs text-slate-300">Copyright © 2026 Astreon. Tous droits réservés.</p><span>◉</span></div></footer>
            </div>
        </>
    );
}
