import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArchiveRestore,
    ArrowLeft,
    Download,
    Lock,
    Paperclip,
    Send,
    UserCheck,
} from 'lucide-react';
import { FormEvent } from 'react';
import AdminShell from './admin-shell';

type Attachment = {
    id: number;
    name: string;
    mime_type?: string | null;
    size: number;
};

type Message = {
    id: number;
    message: string;
    is_admin: boolean;
    created_at: string;
    author?: {
        id: number;
        name: string;
        email: string;
    } | null;
    attachments: Attachment[];
};

type Props = {
    ticket: {
        id: number;
        subject: string;
        priority: string;
        status: string;
        waiting_for: string;
        assigned_to?: number | null;
        created_at: string;
        updated_at: string;
        closed_at?: string | null;
    };
    customer?: {
        id: number;
        name: string;
        email: string;
    } | null;
    assignee?: {
        id: number;
        name: string;
        email: string;
    } | null;
    messages: Message[];
};

type SharedProps = {
    auth?: {
        user?: {
            id?: number;
            name?: string;
        };
    };
    flash?: {
        success?: string;
    };
};

const date = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export default function AdminTicketShow({
    ticket,
    customer,
    assignee,
    messages,
}: Props) {
    const page = usePage<SharedProps>();
    const adminId = page.props.auth?.user?.id;
    const flash = page.props.flash;

    const form = useForm<{
        message: string;
        attachments: File[];
    }>({
        message: '',
        attachments: [],
    });

    const assignedToMe =
        ticket.assigned_to !== null &&
        Number(ticket.assigned_to) === Number(adminId);

    const canReply =
        assignedToMe &&
        ticket.status !== 'closed';

    function submit(event: FormEvent) {
        event.preventDefault();

        form.post(`/admin/tickets/${ticket.id}/reply`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    function action(path: string, confirmation: string) {
        if (!window.confirm(confirmation)) return;
        router.post(path, {}, { preserveScroll: true });
    }

    return (
        <AdminShell>
            <Head title={`Ticket #${ticket.id}`} />

            <Link
                href="/admin/tickets"
                className="inline-flex items-center gap-2 text-sm font-black text-violet-300"
            >
                <ArrowLeft className="h-4 w-4" />
                Retour aux tickets
            </Link>

            <section className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[.28em] text-violet-400">
                        Ticket #{ticket.id}
                    </p>
                    <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                        {ticket.subject}
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        {customer?.name ?? 'Client'} ·{' '}
                        {customer?.email ?? '—'}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {!ticket.assigned_to && ticket.status !== 'closed' && (
                        <button
                            type="button"
                            onClick={() =>
                                action(
                                    `/admin/tickets/${ticket.id}/assign`,
                                    'Prendre ce ticket en charge ?',
                                )
                            }
                            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 text-sm font-black"
                        >
                            <UserCheck className="h-4 w-4" />
                            Prendre le ticket
                        </button>
                    )}

                    {ticket.status === 'closed' ? (
                        <button
                            type="button"
                            onClick={() =>
                                action(
                                    `/admin/tickets/${ticket.id}/reopen`,
                                    'Rouvrir ce ticket ?',
                                )
                            }
                            className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 text-sm font-black text-emerald-200"
                        >
                            <ArchiveRestore className="h-4 w-4" />
                            Rouvrir
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() =>
                                action(
                                    `/admin/tickets/${ticket.id}/close`,
                                    'Fermer ce ticket ?',
                                )
                            }
                            className="inline-flex h-11 items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 text-sm font-black text-rose-200"
                        >
                            <Lock className="h-4 w-4" />
                            Fermer
                        </button>
                    )}
                </div>
            </section>

            {flash?.success && (
                <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                    {flash.success}
                </div>
            )}

            <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                    {messages.length === 0 && (
                        <div className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-10 text-center text-sm text-slate-500">
                            Aucun message enregistré sur ce ticket.
                        </div>
                    )}

                    {messages.map((message) => (
                        <article
                            key={message.id}
                            className={`rounded-2xl border p-5 ${
                                message.is_admin
                                    ? 'ml-auto border-violet-400/20 bg-violet-500/10'
                                    : 'mr-auto border-white/10 bg-[#110d20]/90'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-black text-white">
                                        {message.author?.name ??
                                            (message.is_admin
                                                ? 'Administrateur'
                                                : 'Client')}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {message.is_admin
                                            ? 'Équipe Astreon'
                                            : 'Client'}
                                    </p>
                                </div>
                                <time className="text-xs text-slate-600">
                                    {date.format(
                                        new Date(message.created_at),
                                    )}
                                </time>
                            </div>

                            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-200">
                                {message.message}
                            </p>

                            {message.attachments.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {message.attachments.map((file) => (
                                        <a
                                            key={file.id}
                                            href={`/admin/ticket-attachments/${file.id}`}
                                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-xs font-bold text-slate-300"
                                        >
                                            <Download className="h-4 w-4" />
                                            {file.name}
                                            <span className="text-slate-600">
                                                {formatSize(file.size)}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </article>
                    ))}

                    <form
                        onSubmit={submit}
                        className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5"
                    >
                        <h2 className="font-black">Répondre au client</h2>

                        {!canReply && (
                            <p className="mt-3 rounded-xl border border-amber-400/15 bg-amber-500/5 p-3 text-sm text-amber-200/80">
                                {ticket.status === 'closed'
                                    ? 'Le ticket est fermé.'
                                    : 'Vous devez prendre le ticket avant de pouvoir répondre.'}
                            </p>
                        )}

                        <textarea
                            value={form.data.message}
                            onChange={(event) =>
                                form.setData('message', event.target.value)
                            }
                            disabled={!canReply}
                            rows={7}
                            placeholder="Écrivez votre réponse..."
                            className="mt-4 w-full rounded-xl border border-violet-400/15 bg-black/20 p-4 text-sm text-white outline-none placeholder:text-slate-600 disabled:opacity-50"
                        />

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-400">
                                <Paperclip className="h-4 w-4" />
                                Ajouter des fichiers
                                <input
                                    type="file"
                                    multiple
                                    disabled={!canReply}
                                    className="hidden"
                                    onChange={(event) =>
                                        form.setData(
                                            'attachments',
                                            Array.from(
                                                event.target.files ?? [],
                                            ),
                                        )
                                    }
                                />
                            </label>

                            <button
                                type="submit"
                                disabled={!canReply || form.processing}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-black disabled:opacity-40"
                            >
                                <Send className="h-4 w-4" />
                                Envoyer
                            </button>
                        </div>

                        {form.data.attachments.length > 0 && (
                            <p className="mt-3 text-xs text-slate-500">
                                {form.data.attachments.length} fichier(s)
                                sélectionné(s)
                            </p>
                        )}
                    </form>
                </div>

                <aside className="space-y-4">
                    <InfoCard
                        title="Client"
                        items={[
                            ['Nom', customer?.name ?? '—'],
                            ['E-mail', customer?.email ?? '—'],
                        ]}
                    />

                    <InfoCard
                        title="Traitement"
                        items={[
                            ['Priorité', ticket.priority],
                            ['Statut', ticket.status],
                            ['Attend', ticket.waiting_for],
                            ['Attribué à', assignee?.name ?? 'Non attribué'],
                        ]}
                    />

                    <InfoCard
                        title="Dates"
                        items={[
                            [
                                'Création',
                                date.format(new Date(ticket.created_at)),
                            ],
                            [
                                'Mise à jour',
                                date.format(new Date(ticket.updated_at)),
                            ],
                            [
                                'Fermeture',
                                ticket.closed_at
                                    ? date.format(
                                          new Date(ticket.closed_at),
                                      )
                                    : '—',
                            ],
                        ]}
                    />

                    {customer && (
                        <Link
                            href={`/admin/users/${customer.id}`}
                            className="flex h-12 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-sm font-black text-violet-200"
                        >
                            Ouvrir la fiche client
                        </Link>
                    )}
                </aside>
            </section>
        </AdminShell>
    );
}

function InfoCard({
    title,
    items,
}: {
    title: string;
    items: Array<[string, string]>;
}) {
    return (
        <article className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5">
            <h2 className="font-black">{title}</h2>
            <div className="mt-4 space-y-3">
                {items.map(([label, value]) => (
                    <div
                        key={label}
                        className="flex items-start justify-between gap-4 text-sm"
                    >
                        <span className="text-slate-500">{label}</span>
                        <span className="max-w-[60%] break-words text-right font-bold text-slate-200">
                            {value}
                        </span>
                    </div>
                ))}
            </div>
        </article>
    );
}
