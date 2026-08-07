import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Archive,
    Boxes,
    CreditCard,
    LayoutDashboard,
    LifeBuoy,
    LogOut,
    Menu,
    Search,
    Server,
    Settings,
    ShoppingCart,
    Tag,
    Users,
    X,
} from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import NotificationBell from '@/components/notifications/notification-bell';

type Props = {
    children: ReactNode;
};

type SharedProps = {
    auth?: {
        user?: {
            name?: string;
            email?: string;
            role?: string;
        };
    };
};

const navigation = [
    { label: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
    { label: 'Clients', href: '/admin/users', icon: Users },
    { label: 'Services', href: '/admin/servers', icon: Server },
    { label: 'Commandes', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Paiements', href: '/admin/payments', icon: CreditCard },
    { label: 'Codes promo', href: '/admin/promos', icon: Tag },
    { label: 'Tickets', href: '/admin/tickets', icon: LifeBuoy },
    { label: 'Infrastructure', href: '/admin/infrastructure', icon: Boxes },
    { label: 'Sauvegardes', href: '/admin/backups', icon: Archive },
    { label: 'Activité', href: '/admin/logs', icon: Activity },
    { label: 'Paramètres', href: '/admin/settings', icon: Settings },
] as const;

export default function AdminShell({ children }: Props) {
    const [open, setOpen] = useState(false);
    const { auth } = usePage<SharedProps>().props;
    const user = auth?.user;
    const url = window.location.pathname;

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    return (
        <div className="min-h-screen bg-[#070510] text-white">
            {open && (
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
                    aria-label="Fermer le menu"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-[min(86vw,288px)] flex-col border-r border-violet-400/15 bg-[#090714] shadow-2xl transition-transform duration-200 lg:w-72 lg:translate-x-0 ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-20 shrink-0 items-center justify-between border-b border-violet-400/15 px-5">
                    <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3">
                        <img
                            src="/images/astreon/astreon-icon.png"
                            alt="Astreon"
                            className="h-10 w-10 object-contain"
                        />
                        <div>
                            <p className="font-black tracking-[.12em]">ASTREON</p>
                            <p className="text-[10px] font-bold tracking-[.22em] text-violet-400">
                                ADMINISTRATION
                            </p>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 lg:hidden"
                        aria-label="Fermer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain px-4 py-4">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active =
                            item.href === '/admin'
                                ? url === '/admin'
                                : url === item.href || url.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={`flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                                    active
                                        ? 'border border-violet-400/25 bg-violet-500/15 text-white'
                                        : 'border border-transparent text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="shrink-0 border-t border-violet-400/15 p-4">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-rose-300 hover:bg-rose-500/10"
                    >
                        <LogOut className="h-5 w-5" />
                        Déconnexion
                    </Link>
                </div>
            </aside>

            <div className="min-w-0 lg:pl-72">
                <header className="sticky top-0 z-30 border-b border-violet-400/15 bg-[#080612]/95 backdrop-blur-xl">
                    <div className="flex min-h-16 items-center gap-3 px-3 sm:min-h-20 sm:px-6 xl:px-8">
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 lg:hidden"
                            aria-label="Ouvrir le menu admin"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="relative hidden max-w-xl flex-1 md:block">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                            <input
                                type="search"
                                placeholder="Rechercher un client, service ou ticket..."
                                className="h-11 w-full rounded-xl border border-violet-400/15 bg-black/20 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600"
                            />
                        </div>

                        <p className="min-w-0 flex-1 truncate text-sm font-black md:hidden">
                            Administration
                        </p>

                        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
                            <NotificationBell variant="admin" />

                            <div className="hidden items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 sm:flex">
                                <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 font-black">
                                    {(user?.name ?? 'A').slice(0, 1).toUpperCase()}
                                </span>
                                <div className="max-w-36">
                                    <p className="truncate text-sm font-black">
                                        {user?.name ?? 'Administrateur'}
                                    </p>
                                    <p className="text-[11px] text-violet-300">
                                        {user?.role ?? 'admin'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="min-w-0 overflow-hidden p-3 sm:p-6 xl:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
