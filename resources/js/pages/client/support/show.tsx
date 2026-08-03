import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Download,
    Lock,
    Paperclip,
    Send,
    UserCheck,
} from 'lucide-react';
import { FormEvent } from 'react';
import ClientSupportShell from './client-support-shell';

type Attachment = {
    id: number;
    name: string;
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
        created_at: string;
        updated_at: string;
        closed_at?: string | null;
    };
    assignee?: {
        id: number;
        name: string;
    } | null;
    messages: Message[];
    canReply: boolean;
};

type SharedProps = {
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

export default function ClientSupportShow({
    ticket,
    assignee,
    messages,
    canReply,
}: Props) {
    const flash = usePage<SharedProps>().props.flash;

    const form = useForm<{
        message: string;
        attachments: File[];
    }>({
        message: '',
        attachments: [],
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        form.post(`/client/support/${ticket.id}/reply`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <ClientSupportShell>
            <Head title={`Ticket #${ticket.id}`} />

            <Link
                href="/client/support"
                className="inline-flex items-center gap-2 text-sm font-black text-violet-300"
            >
                <ArrowLeft className="h-4 w-4" />
                Retour à l’assistance
            </Link>

            <section className="mt-5">
                <p className="text-xs font-black uppercase tracking-[.28em] text-violet-400">
                    Ticket #{ticket.id}
                </p>
                <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                    {ticket.subject}
                </h1>
                <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-black text-violet-300">
                        {ticket.status}
                    </span>
                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-300">
                        Priorité {ticket.priority}
                    </span>
                    <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-black text-cyan-300">
                        {assignee
                            ? `Pris en charge par ${assignee.name}`
                            : 'En attente d’attribution'}
                    </span>
                </div>
            </section>

            {flash?.success && (
                <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                    {flash.success}
                </div>
            )}

            <section className="mt-6 space-y-4">
                {messages.map((message) => (
                    <article
                        key={message.id}
                        className={`rounded-2xl border p-5 ${
                            message.is_admin
                                ? 'mr-auto border-violet-400/20 bg-violet-500/10'
                                : 'ml-auto border-white/10 bg-[#110d20]/90'
                        }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-black">
                                    {message.author?.name ??
                                        (message.is_admin
                                            ? 'Support Astreon'
                                            : 'Vous')}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {message.is_admin
                                        ? 'Équipe Astreon'
                                        : 'Client'}
                                </p>
                            </div>

                            <time className="text-xs text-slate-600">
                                {date.format(new Date(message.created_at))}
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
                                        href={`/client/support/attachments/${file.id}`}
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
            </section>

            <form
                onSubmit={submit}
                className="mt-6 rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5"
            >
                <div className="flex items-center gap-3">
                    {ticket.status === 'closed' ? (
                        <Lock className="h-5 w-5 text-rose-300" />
                    ) : (
                        <UserCheck className="h-5 w-5 text-violet-300" />
                    )}
                    <div>
                        <h2 className="font-black">
                            {canReply
                                ? 'Répondre au support'
                                : 'Réponse temporairement verrouillée'}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {ticket.status === 'closed'
                                ? 'Ce ticket a été fermé par le support.'
                                : canReply
                                  ? 'Une réponse du support vous attend.'
                                  : 'Vous pourrez écrire après la prochaine réponse d’un administrateur.'}
                        </p>
                    </div>
                </div>

                <textarea
                    value={form.data.message}
                    onChange={(event) =>
                        form.setData('message', event.target.value)
                    }
                    disabled={!canReply}
                    rows={7}
                    placeholder="Écrivez votre réponse..."
                    className="mt-5 w-full rounded-xl border border-violet-400/15 bg-black/20 p-4 text-sm text-white outline-none placeholder:text-slate-600 disabled:opacity-40"
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
                                    Array.from(event.target.files ?? []),
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
                        {form.data.attachments.length} fichier(s) sélectionné(s)
                    </p>
                )}
            </form>
        </ClientSupportShell>
    );
}
