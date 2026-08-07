import { Head, router } from '@inertiajs/react';
import { DatabaseBackup, Play, Save } from 'lucide-react';
import { useState } from 'react';
import AdminShell from './admin-shell';

type Service = {
    id: number;
    name: string;
    reference: string;
    status: string;
    backup_enabled: boolean;
    backup_frequency_hours: number;
    last_backup_at?: string | null;
    next_backup_at?: string | null;
    customer?: { name: string; email: string } | null;
};

export default function AdminBackups({ services }: { services: Service[] }) {
    const [forms, setForms] = useState<Record<number, { enabled: boolean; hours: number }>>(
        Object.fromEntries(services.map((service) => [service.id, {
            enabled: service.backup_enabled,
            hours: service.backup_frequency_hours,
        }])),
    );

    const update = (service: Service) => {
        const form = forms[service.id];
        router.patch(`/admin/backups/${service.id}`, {
            backup_enabled: form.enabled,
            backup_frequency_hours: form.hours,
        }, { preserveScroll: true });
    };

    return (
        <AdminShell>
            <Head title="Sauvegardes automatiques — Astreon" />
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <p className="text-xs font-black uppercase tracking-[.2em] text-violet-300">Infrastructure</p>
                    <h1 className="mt-2 text-3xl font-black">Sauvegardes automatiques</h1>
                    <p className="mt-2 text-sm text-slate-400">Planifiez et lancez les sauvegardes Pterodactyl depuis l’administration.</p>
                </div>

                <div className="grid gap-5">
                    {services.map((service) => {
                        const form = forms[service.id];
                        return (
                            <article key={service.id} className="rounded-2xl border border-violet-400/15 bg-[#100c1d] p-5">
                                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                                    <div className="flex gap-4">
                                        <span className="grid h-12 w-12 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
                                            <DatabaseBackup className="h-6 w-6" />
                                        </span>
                                        <div>
                                            <h2 className="font-black">{service.name}</h2>
                                            <p className="mt-1 text-xs text-slate-500">{service.reference} · {service.customer?.email ?? 'Client inconnu'}</p>
                                            <p className="mt-2 text-xs text-slate-400">Dernière : {service.last_backup_at ? new Date(service.last_backup_at).toLocaleString('fr-FR') : 'jamais'} · Prochaine : {service.next_backup_at ? new Date(service.next_backup_at).toLocaleString('fr-FR') : 'non planifiée'}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <label className="flex items-center gap-2 rounded-xl border border-violet-400/15 px-4 py-3 text-sm font-bold">
                                            <input
                                                type="checkbox"
                                                checked={form.enabled}
                                                onChange={(event) => setForms((current) => ({ ...current, [service.id]: { ...form, enabled: event.target.checked } }))}
                                            />
                                            Automatique
                                        </label>
                                        <select
                                            value={form.hours}
                                            onChange={(event) => setForms((current) => ({ ...current, [service.id]: { ...form, hours: Number(event.target.value) } }))}
                                            className="h-11 rounded-xl border border-violet-400/15 bg-black/20 px-3 text-sm"
                                        >
                                            <option value={6}>Toutes les 6 h</option>
                                            <option value={12}>Toutes les 12 h</option>
                                            <option value={24}>Chaque jour</option>
                                            <option value={48}>Tous les 2 jours</option>
                                            <option value={168}>Chaque semaine</option>
                                        </select>
                                        <button onClick={() => update(service)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-black hover:bg-violet-500">
                                            <Save className="h-4 w-4" /> Enregistrer
                                        </button>
                                        <button onClick={() => router.post(`/admin/backups/${service.id}/create`, {}, { preserveScroll: true })} className="inline-flex h-11 items-center gap-2 rounded-xl border border-violet-400/20 px-4 text-sm font-black text-violet-200">
                                            <Play className="h-4 w-4" /> Créer maintenant
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </AdminShell>
    );
}
