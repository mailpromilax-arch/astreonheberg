import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Ban,
    CheckCircle2,
    Save,
    Server,
    ShieldAlert,
    User,
} from 'lucide-react';
import { FormEvent } from 'react';
import AdminShell from './admin-shell';

type Value = string | number | boolean | null | undefined;

type Props = {
    service: Record<string, Value>;
    customer?: {
        id: number;
        name: string;
        email: string;
    } | null;
    order?: Record<string, Value> | null;
    capabilities: {
        has_status: boolean;
        has_cpu: boolean;
        has_memory: boolean;
        has_disk: boolean;
        has_expires_at: boolean;
    };
};

type Flash = {
    success?: string;
};

function text(value: Value): string {
    return value === null || value === undefined || value === ''
        ? '—'
        : String(value);
}

export default function AdminServerShow({
    service,
    customer,
    order,
    capabilities,
}: Props) {
    const flash = usePage<{ flash?: Flash }>().props.flash;

    const form = useForm({
        name: text(service.name) === '—' ? '' : text(service.name),
        status:
            text(service.status) === '—'
                ? 'active'
                : text(service.status),
        cpu: text(service.cpu) === '—' ? '' : text(service.cpu),
        memory:
            text(service.memory) === '—' ? '' : text(service.memory),
        disk: text(service.disk) === '—' ? '' : text(service.disk),
        expires_at:
            text(service.expires_at) === '—'
                ? ''
                : text(service.expires_at).slice(0, 10),
        node: text(service.node ?? service.node_name) === '—'
            ? ''
            : text(service.node ?? service.node_name),
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.put(`/admin/servers/${service.id}`);
    }

    function postAction(path: string, confirmation: string) {
        if (!window.confirm(confirmation)) {
            return;
        }

        router.post(path, {}, { preserveScroll: true });
    }

    const details = Object.entries(service).filter(
        ([key]) =>
            ![
                'credentials',
                'api_token',
                'password',
                'secret',
            ].includes(key),
    );

    return (
        <AdminShell>
            <Head title={`Service · ${text(service.name)}`} />

            <Link
                href="/admin/servers"
                className="inline-flex items-center gap-2 text-sm font-black text-violet-300"
            >
                <ArrowLeft className="h-4 w-4" />
                Retour aux services
            </Link>

            <section className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[.28em] text-violet-400">
                        Service #{text(service.id)}
                    </p>
                    <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                        {text(service.name ?? service.reference)}
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        {text(
                            service.reference ??
                                service.identifier ??
                                service.uuid,
                        )}
                    </p>
                </div>

                {capabilities.has_status && (
                    <div className="flex flex-wrap gap-2">
                        {service.status === 'suspended' ? (
                            <button
                                type="button"
                                onClick={() =>
                                    postAction(
                                        `/admin/servers/${service.id}/activate`,
                                        'Réactiver ce service ?',
                                    )
                                }
                                className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 text-sm font-black text-emerald-200"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Réactiver
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() =>
                                    postAction(
                                        `/admin/servers/${service.id}/suspend`,
                                        'Suspendre ce service ?',
                                    )
                                }
                                className="inline-flex h-11 items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 text-sm font-black text-rose-200"
                            >
                                <Ban className="h-4 w-4" />
                                Suspendre
                            </button>
                        )}
                    </div>
                )}
            </section>

            {flash?.success && (
                <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                    {flash.success}
                </div>
            )}

            <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
                <form
                    onSubmit={submit}
                    className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5 sm:p-6"
                >
                    <div className="flex items-center gap-3">
                        <Server className="h-5 w-5 text-violet-300" />
                        <div>
                            <h2 className="text-lg font-black">
                                Configuration du service
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Modifiez les informations et limites enregistrées.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <label className="md:col-span-2">
                            <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                Nom du service
                            </span>
                            <input
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                className="h-12 w-full rounded-xl border border-violet-400/15 bg-black/20 px-4 text-sm text-white outline-none"
                            />
                        </label>

                        {capabilities.has_status && (
                            <label>
                                <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                    Statut
                                </span>
                                <select
                                    value={form.data.status}
                                    onChange={(event) =>
                                        form.setData(
                                            'status',
                                            event.target.value,
                                        )
                                    }
                                    className="h-12 w-full rounded-xl border border-violet-400/15 bg-[#0c0917] px-4 text-sm text-white outline-none"
                                >
                                    <option value="active">Actif</option>
                                    <option value="running">En ligne</option>
                                    <option value="provisioning">
                                        Livraison
                                    </option>
                                    <option value="suspended">
                                        Suspendu
                                    </option>
                                    <option value="expired">Expiré</option>
                                </select>
                            </label>
                        )}

                        <label>
                            <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                Nœud
                            </span>
                            <input
                                value={form.data.node}
                                onChange={(event) =>
                                    form.setData('node', event.target.value)
                                }
                                className="h-12 w-full rounded-xl border border-violet-400/15 bg-black/20 px-4 text-sm text-white outline-none"
                            />
                        </label>

                        {capabilities.has_cpu && (
                            <label>
                                <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                    CPU
                                </span>
                                <input
                                    type="number"
                                    value={form.data.cpu}
                                    onChange={(event) =>
                                        form.setData('cpu', event.target.value)
                                    }
                                    className="h-12 w-full rounded-xl border border-violet-400/15 bg-black/20 px-4 text-sm text-white outline-none"
                                />
                            </label>
                        )}

                        {capabilities.has_memory && (
                            <label>
                                <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                    Mémoire
                                </span>
                                <input
                                    type="number"
                                    value={form.data.memory}
                                    onChange={(event) =>
                                        form.setData(
                                            'memory',
                                            event.target.value,
                                        )
                                    }
                                    className="h-12 w-full rounded-xl border border-violet-400/15 bg-black/20 px-4 text-sm text-white outline-none"
                                />
                            </label>
                        )}

                        {capabilities.has_disk && (
                            <label>
                                <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                    Disque
                                </span>
                                <input
                                    type="number"
                                    value={form.data.disk}
                                    onChange={(event) =>
                                        form.setData('disk', event.target.value)
                                    }
                                    className="h-12 w-full rounded-xl border border-violet-400/15 bg-black/20 px-4 text-sm text-white outline-none"
                                />
                            </label>
                        )}

                        {capabilities.has_expires_at && (
                            <label>
                                <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                    Expiration
                                </span>
                                <input
                                    type="date"
                                    value={form.data.expires_at}
                                    onChange={(event) =>
                                        form.setData(
                                            'expires_at',
                                            event.target.value,
                                        )
                                    }
                                    className="h-12 w-full rounded-xl border border-violet-400/15 bg-black/20 px-4 text-sm text-white outline-none"
                                />
                            </label>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 text-sm font-black disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        Enregistrer
                    </button>
                </form>

                <aside className="space-y-6">
                    <article className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-violet-300" />
                            <h2 className="font-black">
                                Propriétaire
                            </h2>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm font-black">
                                {customer?.name ?? 'Aucun client'}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                {customer?.email ?? '—'}
                            </p>

                            {customer && (
                                <Link
                                    href={`/admin/users/${customer.id}`}
                                    className="mt-4 inline-flex h-10 items-center rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 text-sm font-black text-violet-200"
                                >
                                    Ouvrir le client
                                </Link>
                            )}
                        </div>
                    </article>

                    <article className="rounded-2xl border border-amber-400/15 bg-amber-500/5 p-5">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="h-5 w-5 text-amber-300" />
                            <h2 className="font-black text-amber-100">
                                Contrôles Pterodactyl
                            </h2>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-amber-100/65">
                            Les commandes temps réel, la console, les fichiers,
                            sauvegardes et bases de données seront branchés dans
                            le prochain sous-module à partir de l’API déjà
                            utilisée par votre espace client.
                        </p>
                    </article>

                    <article className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5">
                        <h2 className="font-black">
                            Informations techniques
                        </h2>

                        <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto">
                            {details.map(([key, value]) => (
                                <div
                                    key={key}
                                    className="flex items-start justify-between gap-4 rounded-xl border border-white/5 bg-black/10 p-3"
                                >
                                    <span className="text-xs font-black uppercase text-slate-600">
                                        {key}
                                    </span>
                                    <span className="max-w-[60%] break-all text-right text-xs text-slate-300">
                                        {text(value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </article>

                    {order && (
                        <article className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5">
                            <h2 className="font-black">
                                Commande liée
                            </h2>
                            <p className="mt-3 text-sm text-slate-300">
                                {text(
                                    order.reference ??
                                        order.id,
                                )}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                {text(order.status)}
                            </p>
                        </article>
                    )}
                </aside>
            </section>
        </AdminShell>
    );
}
