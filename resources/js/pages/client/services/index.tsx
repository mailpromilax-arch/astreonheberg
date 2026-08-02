import { Link } from '@inertiajs/react';
import { Cpu, Database, HardDrive, Package, Server, Users } from 'lucide-react';
import ClientLayout from '@/layouts/client-layout';

type Service = {
    id: number;
    reference: string;
    name: string;
    status: string;
    display_status: string;
    provider: string | null;
    external_url: string | null;
    activated_at: string | null;
    expires_at: string | null;
    created_at: string;
    configuration?: {
        allocation?: { ip?: string; alias?: string; port?: number };
        delivered_resources?: {
            memory_mb?: number;
            memory_gb?: number;
            disk_mb?: number;
            disk_gb?: number;
            cpu_percent?: number;
            player_slots?: number;
            databases?: number;
            backups?: number;
        };
    };
};

type Pagination = {
    data: Service[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });

function statusLabel(status: string) {
    return ({
        provisioning: 'Provisionnement',
        active: 'Actif',
        suspended: 'Suspendu',
        cancelled: 'Annulé',
        expired: 'Expiré',
        failed: 'Échec',
    } as Record<string, string>)[status] ?? status;
}

function statusClass(status: string) {
    return `astreon-status astreon-status-${status}`;
}

function formatGb(mb?: number, gb?: number) {
    if (gb) return `${gb} Go`;
    if (!mb) return '—';
    const value = mb / 1024;
    return `${Number.isInteger(value) ? value : value.toFixed(1)} Go`;
}

export default function ClientServices({ services }: { services: Pagination }) {
    const active = services.data.filter((item) => item.display_status === 'active').length;
    const provisioning = services.data.filter((item) => item.display_status === 'provisioning').length;

    return (
        <ClientLayout
            title="Mes services"
            description="Consultez, gérez et renouvelez tous vos services Astreon."
        >
            <div className="mb-6 flex justify-end">
                <Link href="/boutique" className="astreon-primary-button">
                    Commander un service
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="astreon-stat-card"><Package /><span>Total</span><strong>{services.total}</strong></div>
                <div className="astreon-stat-card"><Server /><span>Actifs</span><strong>{active}</strong></div>
                <div className="astreon-stat-card"><Cpu /><span>En cours</span><strong>{provisioning}</strong></div>
            </div>

            <div className="mt-7 space-y-5">
                {services.data.map((service) => {
                    const resources = service.configuration?.delivered_resources;
                    const allocation = service.configuration?.allocation;
                    const address = allocation?.port && (allocation.alias || allocation.ip)
                        ? `${allocation.alias ?? allocation.ip}:${allocation.port}`
                        : 'En attente';

                    return (
                        <article key={service.id} className="astreon-service-row">
                            <div className="astreon-service-row-head">
                                <div className="flex min-w-0 items-center gap-4">
                                    <div className="astreon-service-icon"><Server /></div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-black uppercase tracking-[.18em] text-orange-500">
                                            {service.provider ?? 'Service'}
                                        </p>
                                        <h2 className="truncate text-xl font-black">{service.name}</h2>
                                        <p className="mt-1 text-sm text-slate-500">{service.reference}</p>
                                    </div>
                                </div>
                                <span className={statusClass(service.display_status)}>
                                    {statusLabel(service.display_status)}
                                </span>
                            </div>

                            <div className="astreon-service-grid">
                                <div><span>Adresse</span><strong>{address}</strong></div>
                                <div><HardDrive /><span>RAM</span><strong>{formatGb(resources?.memory_mb, resources?.memory_gb)}</strong></div>
                                <div><Cpu /><span>CPU</span><strong>{resources?.cpu_percent ?? '—'}%</strong></div>
                                <div><Database /><span>Stockage</span><strong>{formatGb(resources?.disk_mb, resources?.disk_gb)}</strong></div>
                                <div><Users /><span>Joueurs</span><strong>{resources?.player_slots ?? '—'}</strong></div>
                            </div>

                            <div className="astreon-service-row-foot">
                                <p>
                                    Expiration : <strong>{service.expires_at ? dateFormatter.format(new Date(service.expires_at)) : 'Illimitée'}</strong>
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <Link href={`/client/services/${service.id}`} className="astreon-outline-button">Gérer</Link>
                                    {service.external_url && <a href={service.external_url} target="_blank" rel="noreferrer" className="astreon-outline-button">Panel</a>}
                                    <Link href="/client/orders" className="astreon-secondary-button">Renouveler</Link>
                                </div>
                            </div>
                        </article>
                    );
                })}

                {services.data.length === 0 && (
                    <div className="astreon-empty-state">
                        <Package />
                        <h2>Aucun service</h2>
                        <p>Commandez votre premier service Astreon.</p>
                        <Link href="/boutique" className="astreon-primary-button">Découvrir les offres</Link>
                    </div>
                )}
            </div>
        </ClientLayout>
    );
}
