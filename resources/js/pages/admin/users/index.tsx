import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Filter,
    Search,
    ShieldCheck,
    UserRoundCheck,
    UserRoundX,
    Users,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import AdminShell from './admin-shell';

type UserItem = {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    company?: string | null;
    phone?: string | null;
    email_verified_at?: string | null;
    two_factor_enabled: boolean;
    last_login_at?: string | null;
    created_at: string;
};

type PaginatedUsers = {
    data: UserItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    users: PaginatedUsers;
    filters: {
        search: string;
        role: string;
        status: string;
    };
    counts: {
        total: number;
        clients: number;
        admins: number;
        suspended: number;
    };
    capabilities: {
        has_status: boolean;
        has_role: boolean;
        has_two_factor: boolean;
    };
};

const date = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
});

export default function AdminUsersIndex({
    users,
    filters,
    counts,
    capabilities,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [role, setRole] = useState(filters.role);
    const [status, setStatus] = useState(filters.status);

    function submit(event: FormEvent) {
        event.preventDefault();

        router.get(
            '/admin/users',
            { search, role, status },
            {
                preserveState: true,
                replace: true,
            },
        );
    }

    function reset() {
        setSearch('');
        setRole('');
        setStatus('');
        router.get('/admin/users');
    }

    const cards = [
        {
            label: 'Comptes',
            value: counts.total,
            icon: Users,
            tone: 'text-violet-300 bg-violet-500/10',
        },
        {
            label: 'Clients',
            value: counts.clients,
            icon: UserRoundCheck,
            tone: 'text-emerald-300 bg-emerald-500/10',
        },
        {
            label: 'Administrateurs',
            value: counts.admins,
            icon: ShieldCheck,
            tone: 'text-cyan-300 bg-cyan-500/10',
        },
        {
            label: 'Suspendus',
            value: counts.suspended,
            icon: UserRoundX,
            tone: 'text-rose-300 bg-rose-500/10',
        },
    ];

    return (
        <AdminShell>
            <Head title="Gestion des clients" />

            <section>
                <p className="text-xs font-black uppercase tracking-[.28em] text-violet-400">
                    Administration · Clients
                </p>
                <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                    Gestion des comptes
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                    Consultez les informations des clients, leurs accès,
                    services, paiements, commandes et tickets.
                </p>
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <article
                            key={card.label}
                            className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-400">
                                        {card.label}
                                    </p>
                                    <p className="mt-2 text-3xl font-black">
                                        {card.value}
                                    </p>
                                </div>
                                <span
                                    className={`grid h-11 w-11 place-items-center rounded-xl ${card.tone}`}
                                >
                                    <Icon className="h-5 w-5" />
                                </span>
                            </div>
                        </article>
                    );
                })}
            </section>

            <form
                onSubmit={submit}
                className="mt-6 grid gap-3 rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-4 md:grid-cols-[1fr_180px_180px_auto]"
            >
                <label className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Nom, e-mail, entreprise, téléphone..."
                        className="h-12 w-full rounded-xl border border-violet-400/15 bg-black/20 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600"
                    />
                </label>

                {capabilities.has_role && (
                    <select
                        value={role}
                        onChange={(event) => setRole(event.target.value)}
                        className="h-12 rounded-xl border border-violet-400/15 bg-[#0c0917] px-4 text-sm text-white outline-none"
                    >
                        <option value="">Tous les rôles</option>
                        <option value="client">Client</option>
                        <option value="support">Support</option>
                        <option value="admin">Administrateur</option>
                        <option value="super_admin">Super admin</option>
                    </select>
                )}

                {capabilities.has_status && (
                    <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        className="h-12 rounded-xl border border-violet-400/15 bg-[#0c0917] px-4 text-sm text-white outline-none"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="active">Actif</option>
                        <option value="suspended">Suspendu</option>
                        <option value="disabled">Désactivé</option>
                        <option value="banned">Banni</option>
                    </select>
                )}

                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-black"
                    >
                        <Filter className="h-4 w-4" />
                        Filtrer
                    </button>
                    <button
                        type="button"
                        onClick={reset}
                        className="h-12 rounded-xl border border-white/10 px-4 text-sm font-bold text-slate-400 hover:text-white"
                    >
                        Effacer
                    </button>
                </div>
            </form>

            <section className="mt-6 overflow-hidden rounded-2xl border border-violet-400/15 bg-[#110d20]/90">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-violet-400/15 bg-violet-500/5">
                            <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                                <th className="px-5 py-4">Client</th>
                                <th className="px-5 py-4">Rôle</th>
                                <th className="px-5 py-4">Statut</th>
                                <th className="px-5 py-4">Sécurité</th>
                                <th className="px-5 py-4">Inscription</th>
                                <th className="px-5 py-4 text-right">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-violet-400/10">
                            {users.data.map((user) => (
                                <tr
                                    key={user.id}
                                    className="transition hover:bg-violet-500/5"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-500/15 font-black text-violet-300">
                                                {user.name
                                                    .slice(0, 1)
                                                    .toUpperCase()}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-black text-white">
                                                    {user.name}
                                                </p>
                                                <p className="truncate text-xs text-slate-500">
                                                    {user.email}
                                                </p>
                                                {user.company && (
                                                    <p className="mt-1 truncate text-[11px] text-slate-600">
                                                        {user.company}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-black uppercase text-violet-300">
                                            {user.role}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-black ${
                                                user.status === 'active'
                                                    ? 'bg-emerald-500/10 text-emerald-300'
                                                    : 'bg-rose-500/10 text-rose-300'
                                            }`}
                                        >
                                            {user.status}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-xs text-slate-400">
                                        <div className="space-y-1">
                                            <p className="flex items-center gap-2">
                                                <CheckCircle2
                                                    className={`h-4 w-4 ${
                                                        user.email_verified_at
                                                            ? 'text-emerald-400'
                                                            : 'text-slate-600'
                                                    }`}
                                                />
                                                E-mail
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <ShieldCheck
                                                    className={`h-4 w-4 ${
                                                        user.two_factor_enabled
                                                            ? 'text-emerald-400'
                                                            : 'text-slate-600'
                                                    }`}
                                                />
                                                2FA
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-400">
                                        {date.format(
                                            new Date(user.created_at),
                                        )}
                                    </td>

                                    <td className="px-5 py-4 text-right">
                                        <Link
                                            href={`/admin/users/${user.id}`}
                                            className="inline-flex h-10 items-center rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 text-sm font-black text-violet-200 transition hover:bg-violet-500/20"
                                        >
                                            Gérer
                                        </Link>
                                    </td>
                                </tr>
                            ))}

                            {users.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-16 text-center text-sm text-slate-500"
                                    >
                                        Aucun compte ne correspond aux
                                        filtres.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-violet-400/15 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        {users.from ?? 0}–{users.to ?? 0} sur {users.total}
                    </p>

                    <div className="flex gap-2">
                        {users.prev_page_url ? (
                            <Link
                                href={users.prev_page_url}
                                preserveScroll
                                className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-300"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        ) : (
                            <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/5 text-slate-700">
                                <ChevronLeft className="h-4 w-4" />
                            </span>
                        )}

                        <span className="grid h-10 min-w-12 place-items-center rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 font-black text-violet-200">
                            {users.current_page}/{users.last_page}
                        </span>

                        {users.next_page_url ? (
                            <Link
                                href={users.next_page_url}
                                preserveScroll
                                className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-300"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/5 text-slate-700">
                                <ChevronRight className="h-4 w-4" />
                            </span>
                        )}
                    </div>
                </div>
            </section>
        </AdminShell>
    );
}
