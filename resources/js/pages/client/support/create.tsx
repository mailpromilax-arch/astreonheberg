import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Paperclip, Send } from 'lucide-react';
import { FormEvent } from 'react';
import ClientSupportShell from './client-support-shell';

export default function ClientSupportCreate() {
    const form = useForm<{
        subject: string;
        priority: 'low' | 'medium' | 'high';
        message: string;
        attachments: File[];
    }>({
        subject: '',
        priority: 'medium',
        message: '',
        attachments: [],
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const payload = new FormData();
        payload.append('subject', form.data.subject);
        payload.append('priority', form.data.priority);
        payload.append('message', form.data.message);

        for (const file of form.data.attachments) {
            payload.append('attachments[]', file);
        }

        router.post('/client/support', payload, {
            forceFormData: true,
            preserveScroll: true,
            onStart: () => form.clearErrors(),
            onError: (errors) => {
                for (const [key, value] of Object.entries(errors)) {
                    form.setError(key as keyof typeof form.data, String(value));
                }
            },
        });
    }

    const allErrors = Object.values(form.errors).filter(Boolean);

    return (
        <ClientSupportShell>
            <Head title="Créer un ticket" />

            <Link
                href="/client/support"
                className="inline-flex items-center gap-2 text-sm font-black text-violet-300"
            >
                <ArrowLeft className="h-4 w-4" />
                Retour à l’assistance
            </Link>

            <section className="mt-5">
                <p className="text-xs font-black uppercase tracking-[.28em] text-violet-400">
                    Nouveau ticket
                </p>
                <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                    Contacter le support
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                    Décrivez précisément votre demande. Vous pourrez joindre
                    jusqu’à cinq fichiers de 10 Mo maximum.
                </p>
            </section>

            {allErrors.length > 0 && (
                <div className="mt-5 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                    <p className="font-black">
                        Le ticket n’a pas pu être envoyé :
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                        {allErrors.map((error, index) => (
                            <li key={`${error}-${index}`}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            <form
                onSubmit={submit}
                noValidate
                className="mt-8 rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5 sm:p-7"
            >
                <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
                    <label>
                        <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                            Objet
                        </span>
                        <input
                            required
                            value={form.data.subject}
                            onChange={(event) =>
                                form.setData('subject', event.target.value)
                            }
                            placeholder="Exemple : impossible de démarrer mon serveur"
                            className="h-12 w-full rounded-xl border border-violet-400/15 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-slate-600"
                        />
                        {form.errors.subject && (
                            <p className="mt-2 text-xs font-bold text-rose-300">
                                {form.errors.subject}
                            </p>
                        )}
                    </label>

                    <label>
                        <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                            Urgence
                        </span>
                        <select
                            value={form.data.priority}
                            onChange={(event) =>
                                form.setData(
                                    'priority',
                                    event.target.value as
                                        | 'low'
                                        | 'medium'
                                        | 'high',
                                )
                            }
                            className="h-12 w-full rounded-xl border border-violet-400/15 bg-[#0c0917] px-4 text-sm text-white outline-none"
                        >
                            <option value="low">Faible</option>
                            <option value="medium">Moyenne</option>
                            <option value="high">Haute</option>
                        </select>
                    </label>
                </div>

                <label className="mt-5 block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                        Message
                    </span>
                    <textarea
                        required
                        value={form.data.message}
                        onChange={(event) =>
                            form.setData('message', event.target.value)
                        }
                        rows={11}
                        placeholder="Expliquez le problème, les actions déjà essayées et les messages d’erreur observés..."
                        className="w-full rounded-xl border border-violet-400/15 bg-black/20 p-4 text-sm leading-7 text-white outline-none placeholder:text-slate-600"
                    />
                    {form.errors.message && (
                        <p className="mt-2 text-xs font-bold text-rose-300">
                            {form.errors.message}
                        </p>
                    )}
                </label>

                <div className="mt-5 rounded-xl border border-dashed border-violet-400/20 bg-violet-500/5 p-4">
                    <label className="flex cursor-pointer flex-col items-center justify-center py-5 text-center">
                        <Paperclip className="h-6 w-6 text-violet-300" />
                        <span className="mt-3 text-sm font-black">
                            Joindre des fichiers
                        </span>
                        <span className="mt-1 text-xs text-slate-500">
                            Images, PDF, archives, documents ou fichiers de logs
                        </span>
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(event) =>
                                form.setData(
                                    'attachments',
                                    Array.from(event.target.files ?? []),
                                )
                            }
                        />
                    </label>

                    {form.data.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {form.data.attachments.map((file) => (
                                <div
                                    key={`${file.name}-${file.size}`}
                                    className="rounded-lg border border-white/5 bg-black/10 px-3 py-2 text-xs text-slate-300"
                                >
                                    {file.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 text-sm font-black disabled:cursor-wait disabled:opacity-50"
                    >
                        <Send className="h-4 w-4" />
                        {form.processing
                            ? 'Envoi en cours...'
                            : 'Envoyer le ticket'}
                    </button>
                </div>
            </form>
        </ClientSupportShell>
    );
}
