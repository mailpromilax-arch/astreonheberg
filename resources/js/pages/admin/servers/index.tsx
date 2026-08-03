import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Filter,
    Search,
    Server,
    ServerOff,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import AdminShell from './admin-shell';

type ServiceItem = {
    id: number;
    name: string;
    reference: string;
    status: string;
    type: string;
    node?: string | null;
    location?: string | null;
    address?: string | null;
    port?: string | number | null;
    cpu?: string | number | null;
    memory?: string | number | null;
    disk?: string | number | null;
    players?: string | number | null;
    expires_at?: string | null;
    created_at?: string | null;
    customer?: {
        name: string;
        email: string;
    } | null;
};

type Pagination = {
    data: ServiceItem[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    services: Pagination;
    filters: {
        search: string;
        status: string;
        type: string;
    };
    counts: {
        total: number;
        active: number;
        suspended: number;
        expired: number;
    };
    capabilities: {
        has_status: boolean;
        has_expiration: boolean;
    };
};

function statusClasses(status: string): string {
    if (['active', 'running', 'provisioning'].includes(status)) {
        return 'bg-emerald-500/10 text-emerald-300';
    }

    if (['suspended', 'disabled'].includes(status)) {
        return 'bg-rose-500/10 text-rose-300';
    }

    return 'bg-amber-500/10 text-amber-300';
}

export default function AdminServersIndex({
    services,
    filters,
    counts,
    capabilities,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [type, setType] = useState(filters.type);

    function submit(event: FormEvent) {
        event.preventDefault();

        router.get(
            '/admin/servers',
            { search, status, type },
            { preserveState: true, replace: true },
        );
    }

    const cards = [
        {
            label: 'Total',
            value: counts.total,
            icon: Server,
            tone: 'bg-violet-500/10 text-violet-300',
        },
        {
            label: 'Actifs',
            value: counts.active,
            icon: CheckCircle2,
            tone: 'bg-emerald-500/10 text-emerald-300',
        },
        {
            label: 'Suspendus',
            value: counts.suspended,
            icon: ServerOff,
            tone: 'bg-rose-500/10 text-rose-300',
        },
        {
            label: 'Expirés',
            value: counts.expired,
            icon: Clock3,
            tone: 'bg-amber-500/10 text-amber-300',
        },
    ];

    return (
        <AdminShell>
            <Head title="Gestion des services" />

            <section>
                <p className="text-xs font-black uppercase tracking-[.28em] text-violet-400">
                    Administration · Services
                </p>
                <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                    Services livrés
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                    Consultez les serveurs actifs, leurs propriétaires,
                    ressources, nœuds, statuts et dates d’expiration.
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
                        placeholder="Nom, référence, UUID, identifiant..."
                        className="h-12 w-full rounded-xl border border-violet-400/15 bg-black/20 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600"
                    />
                </label>

                <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="h-12 rounded-xl border border-violet-400/15 bg-[#0c0917] px-4 text-sm text-white outline-none"
                >
                    <option value="">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="running">En ligne</option>
                    <option value="provisioning">Livraison</option>
                    <option value="suspended">Suspendu</option>
                    <option value="expired">Expiré</option>
                </select>

                <input
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    placeholder="Type de service"
                    className="h-12 rounded-xl border border-violet-400/15 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-slate-600"
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
                                <th className="px-5 py-4">Service</th>
                                <th className="px-5 py-4">Client</th>
                                <th className="px-5 py-4">Ressources</th>
                                <th className="px-5 py-4">Nœud</th>
                                <th className="px-5 py-4">Statut</th>
                                <th className="px-5 py-4 text-right">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-violet-400/10">
                            {services.data.map((service) => (
                                <tr
                                    key={service.id}
                                    className="transition hover:bg-violet-500/5"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
                                                <Server className="h-5 w-5" />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-black text-white">
                                                    {service.name}
                                                </p>
                                                <p className="truncate text-xs text-slate-500">
                                                    {service.reference}
                                                </p>
                                                <p className="mt-1 text-[11px] uppercase text-violet-400">
                                                    {service.type}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <p className="text-sm font-black text-white">
                                            {service.customer?.name ?? '—'}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {service.customer?.email ?? '—'}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4 text-xs text-slate-400">
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                            <span>CPU {service.cpu ?? '—'}</span>
                                            <span>RAM {service.memory ?? '—'}</span>
                                            <span>Disque {service.disk ?? '—'}</span>
                                            <span>Joueurs {service.players ?? '—'}</span>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <p className="text-sm font-black text-white">
                                            {service.node ?? '—'}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {service.location ?? '—'}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-black ${statusClasses(
                                                service.status,
                                            )}`}
                                        >
                                            {service.status}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-right">
                                        <Link
                                            href={`/admin/servers/${service.id}`}
                                            className="inline-flex h-10 items-center rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 text-sm font-black text-violet-200 hover:bg-violet-500/20"
                                        >
                                            Gérer
                                        </Link>
                                    </td>
                                </tr>
                            ))}

                            {services.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-16 text-center text-sm text-slate-500"
                                    >
                                        Aucun service ne correspond aux filtres.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-violet-400/15 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        {services.from ?? 0}–{services.to ?? 0} sur{' '}
                        {services.total}
                    </p>

                    <div className="flex gap-2">
                        {services.prev_page_url ? (
                            <Link
                                href={services.prev_page_url}
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
                            {services.current_page}/{services.last_page}
                        </span>

                        {services.next_page_url ? (
                            <Link
                                href={services.next_page_url}
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
