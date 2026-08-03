import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Filter,
    LifeBuoy,
    Search,
    UserCheck,
    UserX,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import AdminShell from './admin-shell';

type TicketItem = {
    id: number;
    subject: string;
    priority: string;
    status: string;
    waiting_for: string;
    created_at: string;
    updated_at: string;
    customer?: {
        id: number;
        name: string;
        email: string;
    } | null;
    assignee?: {
        id: number;
        name: string;
    } | null;
};

type Pagination = {
    data: TicketItem[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    tickets: Pagination;
    filters: {
        search: string;
        status: string;
        priority: string;
        assignment: string;
    };
    counts: {
        open: number;
        unassigned: number;
        mine: number;
        high: number;
    };
};

const date = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

function priorityClass(priority: string): string {
    if (priority === 'high') return 'bg-rose-500/10 text-rose-300';
    if (priority === 'low') return 'bg-emerald-500/10 text-emerald-300';
    return 'bg-amber-500/10 text-amber-300';
}

export default function AdminTicketsIndex({
    tickets,
    filters,
    counts,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [priority, setPriority] = useState(filters.priority);
    const [assignment, setAssignment] = useState(filters.assignment);

    function submit(event: FormEvent) {
        event.preventDefault();
        router.get(
            '/admin/tickets',
            { search, status, priority, assignment },
            { preserveState: true, replace: true },
        );
    }

    const cards = [
        { label: 'Ouverts', value: counts.open, icon: LifeBuoy },
        { label: 'Non attribués', value: counts.unassigned, icon: UserX },
        { label: 'Mes tickets', value: counts.mine, icon: UserCheck },
        { label: 'Urgence haute', value: counts.high, icon: AlertTriangle },
    ];

    return (
        <AdminShell>
            <Head title="Tickets support" />

            <section>
                <p className="text-xs font-black uppercase tracking-[.28em] text-violet-400">
                    Administration · Support
                </p>
                <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                    Tickets clients
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                    Prenez en charge les demandes, répondez aux clients,
                    gérez les priorités et conservez l’historique complet.
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
                className="mt-6 grid gap-3 rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-4 xl:grid-cols-[1fr_170px_170px_170px_auto]"
            >
                <label className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Numéro, objet, client ou e-mail..."
                        className="h-12 w-full rounded-xl border border-violet-400/15 bg-black/20 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600"
                    />
                </label>

                <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="h-12 rounded-xl border border-violet-400/15 bg-[#0c0917] px-4 text-sm text-white outline-none"
                >
                    <option value="">Tous les statuts</option>
                    <option value="open">Ouvert</option>
                    <option value="assigned">Attribué</option>
                    <option value="waiting_admin">Attente admin</option>
                    <option value="waiting_client">Attente client</option>
                    <option value="closed">Fermé</option>
                </select>

                <select
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                    className="h-12 rounded-xl border border-violet-400/15 bg-[#0c0917] px-4 text-sm text-white outline-none"
                >
                    <option value="">Toutes priorités</option>
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                </select>

                <select
                    value={assignment}
                    onChange={(event) => setAssignment(event.target.value)}
                    className="h-12 rounded-xl border border-violet-400/15 bg-[#0c0917] px-4 text-sm text-white outline-none"
                >
                    <option value="">Tous les tickets</option>
                    <option value="mine">Mes tickets</option>
                    <option value="unassigned">Non attribués</option>
                </select>

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
                                <th className="px-5 py-4">Ticket</th>
                                <th className="px-5 py-4">Client</th>
                                <th className="px-5 py-4">Priorité</th>
                                <th className="px-5 py-4">Statut</th>
                                <th className="px-5 py-4">Attribution</th>
                                <th className="px-5 py-4">Actualisé</th>
                                <th className="px-5 py-4 text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-violet-400/10">
                            {tickets.data.map((ticket) => (
                                <tr
                                    key={ticket.id}
                                    className="transition hover:bg-violet-500/5"
                                >
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-black text-white">
                                            #{ticket.id} · {ticket.subject}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Attend : {ticket.waiting_for}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        <p className="text-sm font-black text-white">
                                            {ticket.customer?.name ?? '—'}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {ticket.customer?.email ?? '—'}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-black ${priorityClass(ticket.priority)}`}
                                        >
                                            {ticket.priority}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-black text-violet-300">
                                            {ticket.status}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-400">
                                        {ticket.assignee?.name ?? 'Non attribué'}
                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-500">
                                        {date.format(new Date(ticket.updated_at))}
                                    </td>

                                    <td className="px-5 py-4 text-right">
                                        <Link
                                            href={`/admin/tickets/${ticket.id}`}
                                            className="inline-flex h-10 items-center rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 text-sm font-black text-violet-200 hover:bg-violet-500/20"
                                        >
                                            Ouvrir
                                        </Link>
                                    </td>
                                </tr>
                            ))}

                            {tickets.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-5 py-16 text-center text-sm text-slate-500"
                                    >
                                        Aucun ticket ne correspond aux filtres.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-violet-400/15 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        {tickets.from ?? 0}–{tickets.to ?? 0} sur {tickets.total}
                    </p>

                    <div className="flex gap-2">
                        {tickets.prev_page_url ? (
                            <Link
                                href={tickets.prev_page_url}
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
                            {tickets.current_page}/{tickets.last_page}
                        </span>

                        {tickets.next_page_url ? (
                            <Link
                                href={tickets.next_page_url}
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
