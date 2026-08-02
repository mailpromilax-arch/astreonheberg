import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Cloud, Gamepad2, Globe2, Menu, Server, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AstreonLogo from './AstreonLogo';

type MenuKey = 'vps' | 'cloud' | 'gaming' | 'web' | 'other' | null;

const menus = {
    vps: [
        ['VPS NVMe', 'Machines Linux rapides et flexibles', Server],
        ['VPS Windows', 'Bureau distant et applications Windows', Server],
        ['VPS Gaming', 'CPU haute fréquence pour vos jeux', Gamepad2],
        ['VPS Pro', 'Ressources renforcées pour la production', Server],
    ],
    cloud: [
        ['Serveurs dédiés', 'Puissance brute et accès complet', Server],
        ['Cloud applicatif', 'Node.js, Python, Docker et API', Cloud],
        ['Stockage', 'Sauvegardes et espaces privés', Cloud],
        ['Hébergeur', 'Solutions pour revendeurs et agences', Globe2],
    ],
    gaming: [
        ['FiveM', 'Serveurs RP performants et protégés', Gamepad2],
        ['Minecraft', 'Java et Bedrock avec panel complet', Gamepad2],
        ['ARK', 'Hébergement puissant pour vos survivants', Gamepad2],
        ['Palworld', 'Instances rapides et automatisées', Gamepad2],
        ["Garry's Mod", 'Serveurs communautaires sur mesure', Gamepad2],
        ['Rust', 'Faible latence et protection réseau', Gamepad2],
    ],
    web: [
        ['Hébergement Web', 'Sites, boutiques et applications', Globe2],
        ['Revendeur Web', 'Gérez vos propres clients', Globe2],
        ['Bases de données', 'MySQL avec accès phpMyAdmin', Server],
        ['Domaines', 'Reliez facilement vos noms de domaine', Globe2],
    ],
    other: [
        ['Nous contacter', 'Une question avant de commander ?', Globe2],
        ['À propos', 'Découvrez Astreon et notre vision', Cloud],
        ['Discord', 'Rejoignez notre communauté', Gamepad2],
        ['État des services', 'Consultez la disponibilité en direct', Server],
    ],
};

export default function PublicHeader() {
    const { auth } = usePage<{ auth?: { user?: { name: string } | null } }>().props;
    const [openMenu, setOpenMenu] = useState<MenuKey>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const close = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) setOpenMenu(null);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    return (
        <header ref={ref} className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
            <div className="mx-auto flex h-[86px] max-w-6xl items-center justify-between px-5 lg:px-8">
                <AstreonLogo />

                <nav className="hidden items-center gap-1 lg:flex">
                    <Link href="/" className="astreon-nav-link">Accueil</Link>
                    {([
                        ['vps', 'VPS'], ['cloud', 'Service Cloud'], ['gaming', 'Service Gaming'], ['web', 'Service Web'], ['other', 'Autres'],
                    ] as const).map(([key, label]) => (
                        <button key={key} type="button" onClick={() => setOpenMenu(openMenu === key ? null : key)} className={`astreon-nav-link inline-flex items-center gap-1 ${openMenu === key ? 'text-orange-600' : ''}`}>
                            {label}<ChevronDown className="h-4 w-4" />
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <Link href={auth?.user ? '/client' : '/login'} className="astreon-primary-button hidden sm:inline-flex">
                        Espace client
                    </Link>
                    <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 lg:hidden">
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {openMenu && (
                <div className="absolute left-1/2 top-[75px] hidden w-[680px] -translate-x-1/2 overflow-hidden rounded-b-2xl rounded-t-xl border border-slate-200 bg-white p-7 shadow-2xl lg:block">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        {menus[openMenu].map(([title, description, Icon]) => (
                            <Link key={title} href="/boutique" className="group flex gap-4 rounded-xl border-b border-slate-100 p-4 transition hover:bg-orange-50">
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-100 text-orange-600"><Icon className="h-5 w-5" /></span>
                                <span><span className="block font-black text-slate-900 group-hover:text-orange-600">{title}</span><span className="mt-1 block text-sm text-slate-500">{description}</span></span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {mobileOpen && (
                <div className="border-t border-slate-200 bg-white px-5 py-5 lg:hidden">
                    <div className="grid gap-2">
                        <Link href="/" className="astreon-mobile-link">Accueil</Link>
                        <Link href="/boutique" className="astreon-mobile-link">Nos services</Link>
                        <Link href="/client" className="astreon-mobile-link">Espace client</Link>
                        {!auth?.user && <Link href="/login" className="astreon-mobile-link">Connexion</Link>}
                        {!auth?.user && <Link href="/register" className="astreon-mobile-link">Créer un compte</Link>}
                    </div>
                </div>
            )}
        </header>
    );
}
