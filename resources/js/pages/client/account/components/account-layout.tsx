import { Link, usePage } from '@inertiajs/react';
import {
    ContactRound,
    CreditCard,
    KeyRound,
    Mail,
    ShieldCheck,
    UserCog,
    Users,
    WalletCards,
} from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
    children: ReactNode;
    section: string;
};

const accountItems = [
    { label: 'Mes informations', href: '/client/account', icon: UserCog },
    { label: 'Gestion des utilisateurs', href: '/client/account/members', icon: Users },
    { label: 'Modes de paiement', href: '/client/account/payment-methods', icon: CreditCard },
    { label: 'Mon portefeuille', href: '/client/wallet', icon: WalletCards },
    { label: 'Gestion des contacts', href: '/client/account/contacts', icon: ContactRound },
    { label: 'Historique des courriels', href: '/client/account/emails', icon: Mail },
];

const securityItems = [
    { label: 'Votre profil', href: '/client/account', icon: UserCog },
    { label: 'Modifier le mot de passe', href: '/client/account/password', icon: KeyRound },
    { label: 'Paramètres de sécurité', href: '/client/account/security', icon: ShieldCheck },
];

export default function AccountLayout({
    children,
    section,
}: Props) {
    const { url } = usePage();

    const items = section === 'security'
        ? securityItems
        : accountItems;

    return (
        <div className="min-h-screen bg-[#080611] text-white">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                    <aside className="h-fit overflow-hidden rounded-2xl border border-violet-400/15 bg-[#110d20]/90">
                        <div className="border-b border-violet-400/15 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/10 px-5 py-4">
                            <p className="text-sm font-black uppercase tracking-wider text-violet-200">
                                {section === 'security' ? 'Votre profil' : 'Compte'}
                            </p>
                        </div>

                        <nav className="p-2">
                            {items.map((item) => {
                                const Icon = item.icon;
                                const active = item.href === '/client/account'
                                    ? url === item.href
                                    : url.startsWith(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                                            active
                                                ? 'bg-violet-500/15 text-violet-200'
                                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>

                    <main>{children}</main>
                </div>
            </div>
        </div>
    );
}
