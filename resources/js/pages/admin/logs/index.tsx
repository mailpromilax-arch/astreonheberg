import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    ChevronLeft,
    ChevronRight,
    Filter,
    Search,
    ShieldCheck,
    UserRoundCog,
    CalendarDays,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import AdminShell from './admin-shell';

type LogItem = {
    id: number;
    action: string;
    description?: string | null;
    ip_address?: string | null;
    user_agent?: string | null;
    target_user_id?: number | null;
    order_id?: number | null;
    service_id?: number | null;
    ticket_id?: number | null;
    created_at?: string | null;
    admin?: {
        id: number;
        name: string;
        email: string;
    } | null;
};

type Pagination = {
    data: LogItem[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    logs: Pagination;
    actions: string[];
    admins: Array<{
        id: number;
        name: string;
        email: string;
    }>;
    filters: {
        search: string;
        action: string;
        admin: string;
        date_from: string;
        date_to: string;
    };
    stats: {
        total: number;
        today: number;
        security: number;
        unique_admins: number;
    };
};

const date = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

function actionClass(action: string): string {
    if (
        action.includes('password')
        || action.includes('two_factor')
        || action.includes('suspend')
        || action.includes('delete')
    ) {
        return 'bg-rose-500/10 text-rose-300';
    }

    if (
        action.includes('created')
        || action.includes('activated')
        || action.includes('assigned')
    ) {
        return 'bg-emerald-500/10 text-emerald-300';
    }

    return 'bg-violet-500/10 text-violet-300';
}

export default function AdminLogsIndex({
    logs,
    actions,
    admins,
    filters,
    stats,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [action, setAction] = useState(filters.action);
    const [admin, setAdmin] = useState(filters.admin);
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);

    function submit(event: FormEvent) {
        event.preventDefault();

        router.get(
            '/admin/logs',
            {
                search,
                action,
                admin,
                date_from: dateFrom,
                date_to: dateTo,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    }

    const cards = [
        { label: 'Événements', value: stats.total, icon: Activity },
        { label: 'Aujourd’hui', value: stats.today, icon: CalendarDays },
        { label: 'Sécurité', value: stats.security, icon: ShieldCheck },
        { label: 'Administrateurs', value: stats.unique_admins, icon: UserRoundCog },
    ];

    return (
        <AdminShell>
            <Head title="Journal d’activité" />

            <section>
                <p className="text-xs font-black uppercase tracking-[.28em] text-violet-400">
                    Administration · Activité
                </p>
                <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                    Journal d’administration
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                    Historique des actions réalisées sur les clients, services,
                    commandes, paiements et tickets.
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

                                <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/10 text-violet-300">
                                    <Icon className="h-5 w-5" />
                                </span>
                            </div>
                        </article>
                    );
                })}
            </section>

            <form
                onSubmit={submit}
                className="mt-6 grid gap-3 rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-4 xl:grid-cols-[1fr_220px_220px_160px_160px_auto]"
            >
                <label className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Action, description, IP ou identifiant..."
                        className="h-12 w-full rounded-xl border border-violet-400/15 bg-black/20 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600"
                    />
                </label>

                <select
                    value={action}
                    onChange={(event) => setAction(event.target.value)}
                    className="h-12 rounded-xl border border-violet-400/15 bg-[#0c0917] px-4 text-sm text-white outline-none"
                >
                    <option value="">Toutes les actions</option>
                    {actions.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>

                <select
                    value={admin}
                    onChange={(event) => setAdmin(event.target.value)}
                    className="h-12 rounded-xl border border-violet-400/15 bg-[#0c0917] px-4 text-sm text-white outline-none"
                >
                    <option value="">Tous les administrateurs</option>
                    {admins.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </select>

                <input
                    type="date"
                    value={dateFrom}
                    onChange={(event) => setDateFrom(event.target.value)}
                    className="h-12 rounded-xl border border-violet-400/15 bg-[#0c0917] px-4 text-sm text-white outline-none"
                />

                <input
                    type="date"
                    value={dateTo}
                    onChange={(event) => setDateTo(event.target.value)}
                    className="h-12 rounded-xl border border-violet-400/15 bg-[#0c0917] px-4 text-sm text-white outline-none"
                />

                <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-black"
                >
                    <Filter className="h-4 w-4" />
                    Filtrer
                </button>
            </form>

            <section className="mt-6 overflow-hidden rounded-2xl border border-violet-400/15 bg-[#110d20]/90">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-violet-400/15 bg-violet-500/5">
                            <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                                <th className="px-5 py-4">Date</th>
                                <th className="px-5 py-4">Administrateur</th>
                                <th className="px-5 py-4">Action</th>
                                <th className="px-5 py-4">Description</th>
                                <th className="px-5 py-4">Cible</th>
                                <th className="px-5 py-4">Adresse IP</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-violet-400/10">
                            {logs.data.map((log) => (
                                <tr key={log.id} className="hover:bg-violet-500/5">
                                    <td className="px-5 py-4 text-sm text-slate-500">
                                        {log.created_at
                                            ? date.format(new Date(log.created_at))
                                            : '—'}
                                    </td>

                                    <td className="px-5 py-4">
                                        <p className="text-sm font-black">
                                            {log.admin?.name ?? 'Système'}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {log.admin?.email ?? '—'}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-black ${actionClass(log.action)}`}
                                        >
                                            {log.action}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <p className="max-w-xl text-sm text-slate-300">
                                            {log.description ?? '—'}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        <TargetLinks log={log} />
                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-500">
                                        {log.ip_address ?? '—'}
                                    </td>
                                </tr>
                            ))}

                            {logs.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-16 text-center text-sm text-slate-500"
                                    >
                                        Aucun événement ne correspond aux filtres.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-violet-400/15 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        {logs.from ?? 0}–{logs.to ?? 0} sur {logs.total}
                    </p>

                    <div className="flex gap-2">
                        {logs.prev_page_url ? (
                            <Link
                                href={logs.prev_page_url}
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
                            {logs.current_page}/{logs.last_page}
                        </span>

                        {logs.next_page_url ? (
                            <Link
                                href={logs.next_page_url}
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

function TargetLinks({ log }: { log: LogItem }) {
    const links = [];

    if (log.target_user_id) {
        links.push(
            <Link
                key="user"
                href={`/admin/users/${log.target_user_id}`}
                className="text-xs font-black text-violet-300"
            >
                Client #{log.target_user_id}
            </Link>,
        );
    }

    if (log.order_id) {
        links.push(
            <Link
                key="order"
                href={`/admin/orders/${log.order_id}`}
                className="text-xs font-black text-violet-300"
            >
                Commande #{log.order_id}
            </Link>,
        );
    }

    if (log.service_id) {
        links.push(
            <Link
                key="service"
                href={`/admin/servers/${log.service_id}`}
                className="text-xs font-black text-violet-300"
            >
                Service #{log.service_id}
            </Link>,
        );
    }

    if (log.ticket_id) {
        links.push(
            <Link
                key="ticket"
                href={`/admin/tickets/${log.ticket_id}`}
                className="text-xs font-black text-violet-300"
            >
                Ticket #{log.ticket_id}
            </Link>,
        );
    }

    if (links.length === 0) {
        return <span className="text-xs text-slate-600">—</span>;
    }

    return <div className="flex flex-col gap-1">{links}</div>;
}
