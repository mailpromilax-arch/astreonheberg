import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Boxes,
    Building2,
    Cpu,
    Database,
    HardDrive,
    MapPin,
    MemoryStick,
    RefreshCw,
    Server,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import AdminShell from './admin-shell';

type NodeItem = {
    id: number;
    name: string;
    hostname?: string | null;
    status: string;
    location_id?: number | null;
    cpu_total: number;
    memory_total: number;
    disk_total: number;
    servers_count: number;
};

type LocationItem = {
    id: number;
    name: string;
    country?: string | null;
    city?: string | null;
    short?: string | null;
    description?: string | null;
};

type ServerItem = {
    id: number;
    name: string;
    status: string;
    node?: string | number | null;
    location_id?: number | null;
    cpu?: string | number | null;
    memory?: string | number | null;
    disk?: string | number | null;
    customer?: {
        id: number;
        name: string;
        email: string;
    } | null;
};

type Props = {
    nodes: NodeItem[];
    locations: LocationItem[];
    servers: ServerItem[];
    stats: {
        nodes: number;
        online_nodes: number;
        locations: number;
        servers: number;
        active_servers: number;
        cpu_total: number;
        memory_total: number;
        disk_total: number;
    };
};

type SharedProps = {
    flash?: {
        success?: string;
        error?: string;
    };
};

function statusClass(status: string): string {
    if (['online', 'active', 'healthy', 'running'].includes(status)) {
        return 'bg-emerald-500/10 text-emerald-300';
    }

    if (['offline', 'failed', 'down', 'suspended'].includes(status)) {
        return 'bg-rose-500/10 text-rose-300';
    }

    return 'bg-amber-500/10 text-amber-300';
}

export default function AdminInfrastructureIndex({
    nodes,
    locations,
    servers,
    stats,
}: Props) {
    const [syncing, setSyncing] = useState(false);
    const flash = usePage<SharedProps>().props.flash;

    function synchronize() {
        if (syncing) return;

        setSyncing(true);

        router.post(
            '/admin/infrastructure/sync',
            {},
            {
                preserveScroll: true,
                onFinish: () => setSyncing(false),
            },
        );
    }

    const cards = [
        { label: 'Nœuds', value: stats.nodes, icon: Server },
        { label: 'Nœuds en ligne', value: stats.online_nodes, icon: ShieldCheck },
        { label: 'Localisations', value: stats.locations, icon: MapPin },
        { label: 'Serveurs', value: stats.servers, icon: Boxes },
        { label: 'Serveurs actifs', value: stats.active_servers, icon: Database },
    ];

    return (
        <AdminShell>
            <Head title="Infrastructure" />

            <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[.28em] text-violet-400">
                        Administration · Infrastructure
                    </p>
                    <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                        Infrastructure Astreon
                    </h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                        Données synchronisées depuis l’Application API
                        Pterodactyl.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={synchronize}
                    disabled={syncing}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-black disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
                </button>
            </section>

            {flash?.success && (
                <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                    {flash.success}
                </div>
            )}

            {flash?.error && (
                <div className="mt-5 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-200">
                    {flash.error}
                </div>
            )}

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <article key={card.label} className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-400">{card.label}</p>
                                    <p className="mt-2 text-3xl font-black">{card.value}</p>
                                </div>
                                <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/10 text-violet-300">
                                    <Icon className="h-5 w-5" />
                                </span>
                            </div>
                        </article>
                    );
                })}
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-3">
                <ResourceCard label="CPU total" value={stats.cpu_total} suffix="%" icon={Cpu} />
                <ResourceCard label="Mémoire totale" value={stats.memory_total} suffix="Mo" icon={MemoryStick} />
                <ResourceCard label="Disque total" value={stats.disk_total} suffix="Mo" icon={HardDrive} />
            </section>

            <section className="mt-6 rounded-2xl border border-violet-400/15 bg-[#110d20]/90">
                <div className="flex items-center gap-3 border-b border-violet-400/15 p-5">
                    <Server className="h-5 w-5 text-violet-300" />
                    <div>
                        <h2 className="font-black">Nœuds Pterodactyl</h2>
                        <p className="mt-1 text-sm text-slate-500">Capacités et état des machines hôtes.</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-violet-400/10 bg-violet-500/5">
                            <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                                <th className="px-5 py-4">Nœud</th>
                                <th className="px-5 py-4">Statut</th>
                                <th className="px-5 py-4">RAM</th>
                                <th className="px-5 py-4">Disque</th>
                                <th className="px-5 py-4">Serveurs</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-violet-400/10">
                            {nodes.map((node) => (
                                <tr key={node.id}>
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-black">{node.name}</p>
                                        <p className="mt-1 text-xs text-slate-500">{node.hostname ?? '—'}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(node.status)}`}>
                                            {node.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-300">{node.memory_total.toLocaleString('fr-FR')} Mo</td>
                                    <td className="px-5 py-4 text-sm text-slate-300">{node.disk_total.toLocaleString('fr-FR')} Mo</td>
                                    <td className="px-5 py-4 text-sm font-black text-violet-200">{node.servers_count}</td>
                                </tr>
                            ))}
                            {nodes.length === 0 && (
                                <tr><td colSpan={5} className="px-5 py-14 text-center text-sm text-slate-500">Cliquez sur « Synchroniser maintenant ».</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
                <article className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90">
                    <div className="flex items-center gap-3 border-b border-violet-400/15 p-5">
                        <Building2 className="h-5 w-5 text-violet-300" />
                        <h2 className="font-black">Localisations</h2>
                    </div>
                    <div className="space-y-3 p-5">
                        {locations.map((location) => (
                            <div key={location.id} className="rounded-xl border border-white/5 bg-black/10 p-4">
                                <p className="text-sm font-black">{location.name}</p>
                                <p className="mt-1 text-xs text-slate-500">{location.short ?? '—'}</p>
                            </div>
                        ))}
                        {locations.length === 0 && <p className="py-10 text-center text-sm text-slate-500">Aucune localisation synchronisée.</p>}
                    </div>
                </article>

                <article className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90">
                    <div className="flex items-center gap-3 border-b border-violet-400/15 p-5">
                        <Boxes className="h-5 w-5 text-violet-300" />
                        <h2 className="font-black">Serveurs Pterodactyl</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b border-violet-400/10 bg-violet-500/5">
                                <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                                    <th className="px-5 py-4">Serveur</th>
                                    <th className="px-5 py-4">Client</th>
                                    <th className="px-5 py-4">Nœud</th>
                                    <th className="px-5 py-4">Statut</th>
                                    <th className="px-5 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-violet-400/10">
                                {servers.map((server) => (
                                    <tr key={server.id}>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-black">{server.name}</p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                CPU {server.cpu ?? 0}% · RAM {server.memory ?? 0} Mo · Disque {server.disk ?? 0} Mo
                                            </p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-black">{server.customer?.name ?? 'Non associé'}</p>
                                            <p className="mt-1 text-xs text-slate-500">{server.customer?.email ?? '—'}</p>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-400">{server.node ?? '—'}</td>
                                        <td className="px-5 py-4">
                                            <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(server.status)}`}>
                                                {server.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <Link href={`/admin/servers/${server.id}`} className="inline-flex h-10 items-center rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 text-sm font-black text-violet-200">
                                                Gérer
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {servers.length === 0 && (
                                    <tr><td colSpan={5} className="px-5 py-14 text-center text-sm text-slate-500">Aucun serveur synchronisé.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </article>
            </section>
        </AdminShell>
    );
}

function ResourceCard({
    label,
    value,
    suffix,
    icon: Icon,
}: {
    label: string;
    value: number;
    suffix: string;
    icon: typeof Cpu;
}) {
    return (
        <article className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-400">{label}</p>
                    <p className="mt-2 text-2xl font-black">{value.toLocaleString('fr-FR')} {suffix}</p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/10 text-violet-300">
                    <Icon className="h-5 w-5" />
                </span>
            </div>
        </article>
    );
}
