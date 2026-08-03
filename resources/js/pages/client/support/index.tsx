import { Head, Link, router } from '@inertiajs/react';
import {
    Archive,
    ChevronLeft,
    ChevronRight,
    CircleHelp,
    Clock3,
    MessageSquareReply,
    Plus,
} from 'lucide-react';
import ClientSupportShell from './client-support-shell';

type Ticket = {
    id: number;
    subject: string;
    priority: string;
    status: string;
    waiting_for: string;
    assigned_to?: number | null;
    created_at: string;
    updated_at: string;
};

type Pagination = {
    data: Ticket[];
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
    counts: {
        open: number;
        waiting_admin: number;
        waiting_client: number;
        closed: number;
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

export default function ClientSupportIndex({
    tickets,
    counts,
}: Props) {
    const cards = [
        { label: 'Ouverts', value: counts.open, icon: CircleHelp },
        {
            label: 'Attente support',
            value: counts.waiting_admin,
            icon: Clock3,
        },
        {
            label: 'À votre tour',
            value: counts.waiting_client,
            icon: MessageSquareReply,
        },
        { label: 'Fermés', value: counts.closed, icon: Archive },
    ];

    function openCreatePage() {
        router.visit('/client/support/create', {
            preserveScroll: false,
        });
    }

    return (
        <ClientSupportShell>
            <Head title="Assistance" />

            <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[.28em] text-violet-400">
                        Espace client · Assistance
                    </p>
                    <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                        Centre de support
                    </h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                        Créez une demande, joignez vos captures ou documents et
                        suivez les réponses de l’équipe Astreon.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreatePage}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-black shadow-[0_16px_32px_rgba(139,61,255,.25)]"
                >
                    <Plus className="h-4 w-4" />
                    Créer un ticket
                </button>
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

            <section className="mt-6 overflow-hidden rounded-2xl border border-violet-400/15 bg-[#110d20]/90">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-violet-400/15 bg-violet-500/5">
                            <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                                <th className="px-5 py-4">Ticket</th>
                                <th className="px-5 py-4">Priorité</th>
                                <th className="px-5 py-4">Statut</th>
                                <th className="px-5 py-4">Dernière activité</th>
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
                                        <p className="text-sm font-black">
                                            #{ticket.id} · {ticket.subject}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {ticket.waiting_for === 'client'
                                                ? 'Une réponse vous attend'
                                                : 'En attente du support'}
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

                                    <td className="px-5 py-4 text-sm text-slate-500">
                                        {date.format(new Date(ticket.updated_at))}
                                    </td>

                                    <td className="px-5 py-4 text-right">
                                        <Link
                                            href={`/client/support/${ticket.id}`}
                                            className="inline-flex h-10 items-center rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 text-sm font-black text-violet-200 hover:bg-violet-500/20"
                                        >
                                            Consulter
                                        </Link>
                                    </td>
                                </tr>
                            ))}

                            {tickets.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-5 py-16 text-center"
                                    >
                                        <CircleHelp className="mx-auto h-8 w-8 text-violet-400" />
                                        <p className="mt-3 font-black">
                                            Aucun ticket
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Votre historique de support
                                            apparaîtra ici.
                                        </p>
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
        </ClientSupportShell>
    );
}
