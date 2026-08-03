import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Bell,
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
    Users,
    X,
} from 'lucide-react';
import type { ReactNode } from 'react';
import NotificationBell from '@/components/notifications/notification-bell';
import { useState } from 'react';

type Props = {
    children: ReactNode;
};

type SharedProps = {
    auth?: {
        user?: {
            name?: string;
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
    { label: 'Tickets', href: '/admin/tickets', icon: LifeBuoy },
    { label: 'Infrastructure', href: '/admin/infrastructure', icon: Boxes },
    { label: 'Activité', href: '/admin/logs', icon: Activity },
    { label: 'Paramètres', href: '/admin/settings', icon: Settings },
];

export default function AdminShell({ children }: Props) {
    const [open, setOpen] = useState(false);
    const { url, props } = usePage<SharedProps>();
    const user = props.auth?.user;

    return (
        <div className="min-h-screen bg-[#070510] text-white">
            {open && (
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 z-40 bg-black/70 lg:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-violet-400/15 bg-[#090714] transition-transform lg:translate-x-0 ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-20 items-center justify-between border-b border-violet-400/15 px-6">
                    <Link href="/admin" className="flex items-center gap-3">
                        <img
                            src="/images/astreon/astreon-icon.png"
                            alt="Astreon"
                            className="h-10 w-10 object-contain"
                        />
                        <div>
                            <p className="font-black tracking-[.12em]">
                                ASTREON
                            </p>
                            <p className="text-[10px] font-bold tracking-[.24em] text-violet-400">
                                ADMINISTRATION
                            </p>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 lg:hidden"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active =
                            item.href === '/admin'
                                ? url === '/admin'
                                : url.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                                    active
                                        ? 'border border-violet-400/25 bg-violet-500/15 text-white'
                                        : 'border border-transparent text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-violet-400/15 p-4">
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

            <div className="lg:pl-72">
                <header className="sticky top-0 z-30 border-b border-violet-400/15 bg-[#080612]/90 backdrop-blur-xl">
                    <div className="flex min-h-20 items-center gap-4 px-4 sm:px-6 xl:px-8">
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 lg:hidden"
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

                        <div className="ml-auto flex items-center gap-3">
                            <NotificationBell variant="admin" />

                            <div className="hidden items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 sm:flex">
                                <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 font-black">
                                    {(user?.name ?? 'A')
                                        .slice(0, 1)
                                        .toUpperCase()}
                                </span>
                                <div>
                                    <p className="text-sm font-black">
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

                <main className="p-4 sm:p-6 xl:p-8">{children}</main>
            </div>
        </div>
    );
}
