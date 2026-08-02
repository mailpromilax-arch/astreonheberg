import { Link, usePage } from '@inertiajs/react';
import ClientLayout from '@/layouts/client-layout';

type Order = {
    id: number;
    reference: string;
    status: string;
    total_cents: number;
    paid_at: string | null;
    created_at: string;
    items_count: number;
};

type Service = {
    id: number;
    reference: string;
    name: string;
    status: string;
    provider: string | null;
    external_url: string | null;
    expires_at: string | null;
    created_at: string;
    configuration: {
        allocation?: {
            ip?: string;
            alias?: string | null;
            port?: number;
        };
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
    } | null;
};

type Statistics = {
    orders: number;
    pending_orders: number;
    paid_orders: number;
    paid_cents: number;
    services: number;
    active_services: number;
    provisioning_services: number;
    failed_services: number;
    expiring_services: number;
};

type Props = {
    statistics: Statistics;
    latestOrders: Order[];
    latestServices: Service[];
};

type SharedProps = {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
};

const euro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
});

function serviceStatus(status: string): {
    label: string;
    className: string;
} {
    const statuses: Record<
        string,
        {
            label: string;
            className: string;
        }
    > = {
        active: {
            label: 'Actif',
            className:
                'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
        },
        provisioning: {
            label: 'Provisionnement',
            className:
                'border-amber-400/25 bg-amber-400/10 text-amber-300',
        },
        suspended: {
            label: 'Suspendu',
            className:
                'border-orange-400/25 bg-orange-400/10 text-orange-300',
        },
        failed: {
            label: 'Échec',
            className:
                'border-red-400/25 bg-red-400/10 text-red-300',
        },
        cancelled: {
            label: 'Annulé',
            className:
                'border-slate-400/25 bg-slate-400/10 text-slate-300',
        },
        expired: {
            label: 'Expiré',
            className:
                'border-red-400/25 bg-red-400/10 text-red-300',
        },
    };

    return (
        statuses[status] ?? {
            label: status,
            className:
                'border-white/10 bg-white/[0.05] text-slate-300',
        }
    );
}

function orderStatus(status: string): string {
    const statuses: Record<string, string> = {
        pending_payment: 'Paiement en attente',
        paid: 'Payée',
        active: 'Active',
        cancelled: 'Annulée',
        refunded: 'Remboursée',
        failed: 'Échec',
    };

    return statuses[status] ?? status;
}

function formatRam(memoryMb?: number): string {
    if (!memoryMb) {
        return '—';
    }

    const memoryGb = memoryMb / 1024;

    return Number.isInteger(memoryGb)
        ? `${memoryGb} Go`
        : `${memoryGb.toFixed(1)} Go`;
}

export default function ClientDashboard({
    statistics,
    latestOrders,
    latestServices,
}: Props) {
    const page = usePage<SharedProps>();
    const user = page.props.auth.user;

    const firstName =
        user.name.trim().split(/\s+/)[0] || user.name;

    const cards = [
        {
            label: 'Mes services',
            value: statistics.services,
            detail: `${statistics.active_services} actif(s)`,
            accent: 'text-blue-300',
        },
        {
            label: 'Services actifs',
            value: statistics.active_services,
            detail: `${statistics.provisioning_services} en cours`,
            accent: 'text-emerald-300',
        },
        {
            label: 'Commandes',
            value: statistics.orders,
            detail: `${statistics.pending_orders} en attente`,
            accent: 'text-amber-300',
        },
        {
            label: 'Total payé',
            value: euro.format(
                statistics.paid_cents / 100,
            ),
            detail: `${statistics.paid_orders} commande(s) payée(s)`,
            accent: 'text-violet-300',
        },
    ];

    return (
        <ClientLayout
            title={`Bonjour ${firstName} !`}
            description="Consultez vos services, vos commandes et les informations importantes de votre compte AstreonHeberg."
        >
            <section className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-r from-[#111827] via-[#101522] to-[#2b1a14] p-6 text-white shadow-xl sm:p-8">
                <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-500">
                            AstreonHeberg
                        </p>

                        <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                            Besoin d’un nouveau serveur ?
                        </h2>

                        <p className="mt-3 max-w-2xl leading-7 text-slate-500">
                            Découvrez nos offres Minecraft,
                            FiveM, Palworld, ARK et bien plus
                            encore.
                        </p>
                    </div>

                    <Link
                        href="/boutique"
                        className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-7 py-4 font-black shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5"
                    >
                        Voir les offres →
                    </Link>
                </div>
            </section>

            <section className="mt-7 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                {cards.map((card) => (
                    <article
                        key={card.label}
                        className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-white/20"
                    >
                        <p className="text-sm font-bold text-slate-500">
                            {card.label}
                        </p>

                        <p
                            className={`mt-4 text-3xl font-black ${card.accent}`}
                        >
                            {card.value}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                            {card.detail}
                        </p>
                    </article>
                ))}
            </section>

            {(statistics.failed_services > 0 ||
                statistics.expiring_services > 0) && (
                <section className="mt-7 grid gap-4 lg:grid-cols-2">
                    {statistics.failed_services > 0 && (
                        <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.07] p-5">
                            <p className="font-black text-red-300">
                                Provisionnement à vérifier
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {
                                    statistics.failed_services
                                }{' '}
                                service(s) sont actuellement en
                                échec.
                            </p>

                            <Link
                                href="/client/services"
                                className="mt-4 inline-flex text-sm font-black text-red-300"
                            >
                                Consulter les services →
                            </Link>
                        </div>
                    )}

                    {statistics.expiring_services > 0 && (
                        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] p-5">
                            <p className="font-black text-amber-300">
                                Expiration prochaine
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {
                                    statistics.expiring_services
                                }{' '}
                                service(s) expirent dans moins de
                                14 jours.
                            </p>

                            <Link
                                href="/client/services"
                                className="mt-4 inline-flex text-sm font-black text-amber-300"
                            >
                                Voir les échéances →
                            </Link>
                        </div>
                    )}
                </section>
            )}

            <section className="mt-8 grid gap-7 2xl:grid-cols-[1.35fr_0.9fr]">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                        <div>
                            <h2 className="text-xl font-black">
                                Mes services récents
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Les derniers services ajoutés à
                                votre compte.
                            </p>
                        </div>

                        <Link
                            href="/client/services"
                            className="text-sm font-black text-orange-500"
                        >
                            Tout voir
                        </Link>
                    </div>

                    <div className="divide-y divide-white/10">
                        {latestServices.map((service) => {
                            const status = serviceStatus(
                                service.status,
                            );

                            const allocation =
                                service.configuration
                                    ?.allocation;

                            const resources =
                                service.configuration
                                    ?.delivered_resources;

                            return (
                                <Link
                                    key={service.id}
                                    href={`/client/services/${service.id}`}
                                    className="block px-6 py-5 transition hover:bg-white/[0.03]"
                                >
                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <p className="truncate font-black">
                                                    {service.name}
                                                </p>

                                                <span
                                                    className={`rounded-full border px-3 py-1 text-xs font-black ${status.className}`}
                                                >
                                                    {
                                                        status.label
                                                    }
                                                </span>
                                            </div>

                                            <p className="mt-2 text-xs text-slate-500">
                                                {
                                                    service.reference
                                                }
                                            </p>

                                            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                                                <span>
                                                    Adresse :{' '}
                                                    {allocation
                                                        ? `${allocation.alias ?? allocation.ip ?? '—'}:${allocation.port ?? '—'}`
                                                        : 'En attente'}
                                                </span>

                                                <span>
                                                    RAM :{' '}
                                                    {formatRam(
                                                        resources?.memory_mb,
                                                    )}
                                                </span>

                                                <span>
                                                    CPU :{' '}
                                                    {resources?.cpu_percent
                                                        ? `${resources.cpu_percent} %`
                                                        : '—'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="shrink-0 text-sm font-black text-orange-500">
                                            Gérer →
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}

                        {latestServices.length === 0 && (
                            <div className="px-6 py-14 text-center">
                                <p className="text-lg font-black">
                                    Aucun service
                                </p>

                                <p className="mt-2 text-sm text-slate-500">
                                    Vos services apparaîtront ici
                                    après votre première commande.
                                </p>

                                <Link
                                    href="/boutique"
                                    className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-black"
                                >
                                    Commander un service
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-7">
                    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                            <h2 className="text-xl font-black">
                                Dernières commandes
                            </h2>

                            <Link
                                href="/client/orders"
                                className="text-sm font-black text-orange-500"
                            >
                                Tout voir
                            </Link>
                        </div>

                        <div className="divide-y divide-white/10">
                            {latestOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/client/orders/${order.id}`}
                                    className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-white/[0.03]"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-black">
                                            {order.reference}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {dateFormatter.format(
                                                new Date(
                                                    order.created_at,
                                                ),
                                            )}{' '}
                                            · {order.items_count}{' '}
                                            article
                                            {order.items_count > 1
                                                ? 's'
                                                : ''}
                                        </p>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <p className="text-sm font-black">
                                            {euro.format(
                                                order.total_cents /
                                                    100,
                                            )}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {orderStatus(
                                                order.status,
                                            )}
                                        </p>
                                    </div>
                                </Link>
                            ))}

                            {latestOrders.length === 0 && (
                                <p className="px-6 py-10 text-center text-sm text-slate-500">
                                    Aucune commande.
                                </p>
                            )}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-6">
                        <h2 className="text-xl font-black">
                            Accès rapides
                        </h2>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
                            {[
                                {
                                    label: 'Gérer mes services',
                                    href: '/client/services',
                                },
                                {
                                    label: 'Voir mes commandes',
                                    href: '/client/orders',
                                },
                                {
                                    label: 'Modifier mon profil',
                                    href: '/settings/profile',
                                },
                                {
                                    label: 'Sécurité et 2FA',
                                    href: '/settings/security',
                                },
                            ].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-emerald-400/30 hover:text-white"
                                >
                                    {item.label}
                                    <span>→</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </section>
        </ClientLayout>
    );
}