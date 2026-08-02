import {
    Head,
    Link,
    router,
} from '@inertiajs/react';

import {
    useEffect,
    useRef,
    useState,
} from 'react';

import ServerFiles from '@/components/client/ServerFiles';
import ServerBackups from '@/components/client/ServerBackups';
import ServerDatabases from '@/components/client/ServerDatabases';
import ServerStartup from '@/components/client/ServerStartup';
import ServerNetwork from '@/components/client/ServerNetwork';
import ServerConsole from '@/components/client/ServerConsole';
import ServerSchedules from '@/components/client/ServerSchedules';
import ServerApiKeys from '@/components/client/ServerApiKeys';
import ServerUsers from '@/components/client/ServerUsers';
import ServerActivity from '@/components/client/ServerActivity';
import ServerSettings from '@/components/client/ServerSettings';
import {
    Activity,
    BarChart3,
    ChevronLeft,
    CircleGauge,
    CloudCog,
    Code2,
    Database,
    ExternalLink,
    FileText,
    FolderOpen,
    HardDrive,
    KeyRound,
    Network,
    Play,
    Power,
    RefreshCcw,
    Server,
    Settings,
    ShieldCheck,
    Square,
    TerminalSquare,
    Users,
} from 'lucide-react';


type Service = {
    id: number;
    reference: string;
    name: string;
    status: string;
    provider: string | null;
    external_id: string | null;
    external_url: string | null;
    activated_at: string | null;
    suspended_at: string | null;
    expires_at: string | null;
    cancelled_at: string | null;
    created_at: string;
    configuration:{

    allocation?:{

        ip?:string;

        alias?:string;

        port?:number;

    };

    delivered_resources?:{

        memory_mb?:number;

        disk_mb?:number;

        cpu_percent?:number;

        player_slots?:number;

        databases?:number;

        backups?:number;

    };

    quantity?:number;

    billing_cycle?:string;

    sku?:string;

    plan_snapshot?:{

        features?:string[];

        specifications?:Record<string,string|number>;

    };

}|null;
    order: {
        id: number;
        reference: string;
        status: string;
    };
    plan: {
        id: number;
        name: string;
        slug: string;
        product: {
            id: number;
            name: string;
            slug: string;
        } | null;
    } | null;
};

type Props = {
    service: Service;
};

type LiveStats = {
    memoryBytes: number;
    cpuPercent: number;
    diskBytes: number;
    networkRxBytes: number;
    networkTxBytes: number;
    uptimeMs: number;
};

type HistoryPoint = {
    timestamp: number;
    memoryBytes: number;
    cpuPercent: number;
    diskBytes: number;
    networkRxBytes: number;
    networkTxBytes: number;
};

const emptyLiveStats: LiveStats = {
    memoryBytes: 0,
    cpuPercent: 0,
    diskBytes: 0,
    networkRxBytes: 0,
    networkTxBytes: 0,
    uptimeMs: 0,
};

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
});

function statusLabel(status: string): string {
    const labels: Record<string, string> = {
        provisioning: 'Provisionnement',
        active: 'Actif',
        suspended: 'Suspendu',
        cancelled: 'Annulé',
        expired: 'Expiré',
        failed: 'Échec',
    };

    return labels[status] ?? status;
}

function statusClass(status: string): string {
    const classes: Record<string, string> = {
        provisioning: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
        active: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
        suspended: 'border-orange-400/20 bg-orange-400/10 text-orange-300',
        cancelled: 'border-slate-400/20 bg-slate-400/10 text-slate-300',
        expired: 'border-red-400/20 bg-red-400/10 text-red-300',
        failed: 'border-red-400/20 bg-red-400/10 text-red-300',
    };

    return (
        classes[status] ??
        'border-slate-400/20 bg-slate-400/10 text-slate-300'
    );
}

function providerLabel(provider: string | null): string {
    const labels: Record<string, string> = {
        pterodactyl: 'Pterodactyl',
        proxmox: 'Proxmox',
        plesk: 'Plesk',
        manual: 'Provisionnement manuel',
    };

    if (!provider) {
        return 'Provisionnement manuel';
    }

    return labels[provider] ?? provider;
}

function runtimeStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        running: 'En ligne',
        starting: 'Démarrage',
        stopping: 'Arrêt en cours',
        offline: 'Arrêté',
        installing: 'Installation',
        suspended: 'Suspendu',
        unknown: 'Inconnu',
    };

    return labels[status] ?? status;
}

function formatBytes(value: number): string {
    if (!Number.isFinite(value) || value <= 0) {
        return '0 o';
    }

    const units = ['o', 'Ko', 'Mo', 'Go', 'To'];
    const unitIndex = Math.min(
        Math.floor(Math.log(value) / Math.log(1024)),
        units.length - 1,
    );
    const amount = value / 1024 ** unitIndex;

    return `${amount.toLocaleString('fr-FR', {
        maximumFractionDigits: unitIndex === 0 ? 0 : 2,
    })} ${units[unitIndex]}`;
}

function formatUptime(value: number): string {
    if (!Number.isFinite(value) || value <= 0) {
        return '—';
    }

    const totalSeconds = Math.floor(value / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (days > 0) {
        return `${days} j ${hours} h`;
    }

    if (hours > 0) {
        return `${hours} h ${minutes} min`;
    }

    return `${minutes} min`;
}

function clampPercent(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return Math.min(100, Math.max(0, value));
}

export default function ClientServiceShow({ service }: Props) {
    const specifications =
        service.configuration?.plan_snapshot?.specifications ?? {};

    const features =
        service.configuration?.plan_snapshot?.features ?? [];

const resources = service.configuration?.delivered_resources;

const [consoleLines, setConsoleLines] = useState<string[]>([]);
const [socketState, setSocketState] = useState('Connexion...');
const [serverState, setServerState] = useState('unknown');
const [liveStats, setLiveStats] = useState<LiveStats>(emptyLiveStats);
const [metricsHistory, setMetricsHistory] = useState<HistoryPoint[]>([]);
const [activePanel, setActivePanel] = useState<'console' | 'files' | 'backups' | 'databases' | 'startup' | 'network' | 'schedules' | 'users' | 'settings' | 'activity' | 'api'>('console');

const socketRef = useRef<WebSocket | null>(null);

useEffect(() => {
    let disposed = false;
    let reconnectTimer: number | undefined;

    const scheduleReconnect = (delayMs: number) => {
        if (disposed) {
            return;
        }

        if (reconnectTimer) {
            window.clearTimeout(reconnectTimer);
        }

        reconnectTimer = window.setTimeout(connect, delayMs);
    };

    const connect = async () => {
        try {
            setSocketState('Connexion...');

            const response = await fetch(
                `/client/services/${service.id}/websocket`,
                {
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                const retryAfter = Number(
                    payload.retry_after ??
                    response.headers.get('Retry-After') ??
                    60,
                );

                setSocketState(
                    response.status === 429
                        ? `Limité (${retryAfter}s)`
                        : `Erreur HTTP ${response.status}`,
                );

                scheduleReconnect(
                    Math.max(15, retryAfter) * 1000,
                );

                return;
            }

            if (
                disposed ||
                !payload.socket ||
                !payload.token
            ) {
                setSocketState('Accès incomplet');
                scheduleReconnect(60000);
                return;
            }

            socketRef.current?.close();

            /*
             * Le socket retourné par l'API Pterodactyl doit être ouvert
             * tel quel. Le JWT est ensuite envoyé dans l'événement `auth`.
             */
            const socket = new WebSocket(payload.socket);
            socketRef.current = socket;

            socket.onopen = () => {
                if (disposed) {
                    socket.close();
                    return;
                }

                setSocketState('Authentification...');

                socket.send(
                    JSON.stringify({
                        event: 'auth',
                        args: [payload.token],
                    }),
                );
            };

            socket.onmessage = (message) => {
                let eventPayload: {
                    event?: string;
                    args?: unknown[];
                };

                try {
                    eventPayload = JSON.parse(String(message.data));
                } catch {
                    return;
                }

                const event = eventPayload.event ?? '';
                const args = eventPayload.args ?? [];

                console.debug('[Wings]', event, args);

                if (event === 'auth success') {
                    setSocketState('Connecté');

                    socket.send(
                        JSON.stringify({
                            event: 'send logs',
                            args: [null],
                        }),
                    );

                    socket.send(
                        JSON.stringify({
                            event: 'send stats',
                            args: [null],
                        }),
                    );

                    return;
                }

                if (
                    event === 'jwt error' ||
                    event === 'daemon error' ||
                    event === 'daemon message'
                ) {
                    const detail = String(args[0] ?? event);

                    setConsoleLines((current) => [
                        ...current.slice(-499),
                        `[Wings] ${detail}`,
                    ]);

                    setSocketState('Erreur Wings');
                    return;
                }

                if (
                    event === 'console output' ||
                    event === 'install output'
                ) {
                    const line = String(args[0] ?? '');

                    setConsoleLines((current) => [
                        ...current.slice(-499),
                        line,
                    ]);

                    return;
                }

                if (event === 'status') {
                    setServerState(String(args[0] ?? 'unknown'));
                    return;
                }

                if (event === 'stats') {
                    try {
                        const rawStats =
                            typeof args[0] === 'string'
                                ? JSON.parse(args[0])
                                : (args[0] ?? {});

                        const nextStats = {
                            memoryBytes: Number(
                                rawStats.memory_bytes ?? 0,
                            ),
                            cpuPercent: Number(
                                rawStats.cpu_absolute ?? 0,
                            ),
                            diskBytes: Number(
                                rawStats.disk_bytes ?? 0,
                            ),
                            networkRxBytes: Number(
                                rawStats.network?.rx_bytes ?? 0,
                            ),
                            networkTxBytes: Number(
                                rawStats.network?.tx_bytes ?? 0,
                            ),
                            uptimeMs: Number(
                                rawStats.uptime ?? 0,
                            ),
                        };

                        setLiveStats(nextStats);

                        setMetricsHistory((current) => [
                            ...current.slice(-39),
                            {
                                timestamp: Date.now(),
                                memoryBytes: nextStats.memoryBytes,
                                cpuPercent: nextStats.cpuPercent,
                                diskBytes: nextStats.diskBytes,
                                networkRxBytes:
                                    nextStats.networkRxBytes,
                                networkTxBytes:
                                    nextStats.networkTxBytes,
                            },
                        ]);

                        if (rawStats.state) {
                            setServerState(String(rawStats.state));
                        }
                    } catch (error) {
                        console.warn(
                            'Statistiques Wings invalides :',
                            error,
                        );
                    }

                    return;
                }

                if (event === 'token expiring') {
                    setSocketState('Renouvellement...');
                    socket.close();
                }
            };

            socket.onerror = (event) => {
                console.error('Erreur WebSocket Wings :', event);
                setSocketState('Erreur WebSocket');
            };

            socket.onclose = (event) => {
                if (socketRef.current === socket) {
                    socketRef.current = null;
                }

                if (disposed) {
                    return;
                }

                console.warn(
                    'WebSocket Wings fermé :',
                    event.code,
                    event.reason,
                );

                setSocketState(
                    event.code === 1000
                        ? 'Déconnecté'
                        : `Déconnecté (${event.code})`,
                );

                scheduleReconnect(15000);
            };
        } catch (error) {
            console.error('Connexion console impossible :', error);
            setSocketState(
                error instanceof Error
                    ? `Erreur: ${error.message}`
                    : 'Erreur',
            );
            scheduleReconnect(60000);
        }
    };

    connect();

    return () => {
        disposed = true;

        if (reconnectTimer) {
            window.clearTimeout(reconnectTimer);
        }

        const socket = socketRef.current;
        socketRef.current = null;
        socket?.close();
    };
}, [service.id]);

const sendConsoleCommand = (value: string) => {
    const socket = socketRef.current;

    if (
        value.trim() === '' ||
        !socket ||
        socket.readyState !== WebSocket.OPEN
    ) {
        return;
    }

    socket.send(
        JSON.stringify({
            event: 'send command',
            args: [value.trim()],
        }),
    );
};

const power = (signal: "start" | "stop" | "restart" | "kill") => {

    router.post(
    `/client/services/${service.id}/power`,
    {
        signal,
    },
    {
        preserveScroll: true,
    },
);

};

const allocation = service.configuration?.allocation;

const memoryLimitBytes = (resources?.memory_mb ?? 0) * 1024 * 1024;
const diskLimitBytes = (resources?.disk_mb ?? 0) * 1024 * 1024;

const memoryPercent =
    memoryLimitBytes > 0
        ? clampPercent(
              (liveStats.memoryBytes / memoryLimitBytes) * 100,
          )
        : 0;

const diskPercent =
    diskLimitBytes > 0
        ? clampPercent(
              (liveStats.diskBytes / diskLimitBytes) * 100,
          )
        : 0;

const cpuPercent = clampPercent(liveStats.cpuPercent);

const monitoringCards = [
    {
        label: 'RAM',
        value: `${formatBytes(liveStats.memoryBytes)} / ${formatBytes(
            memoryLimitBytes,
        )}`,
        percent: memoryPercent,
        barClass: 'bg-emerald-500',
    },
    {
        label: 'CPU',
        value: `${liveStats.cpuPercent.toLocaleString('fr-FR', {
            maximumFractionDigits: 1,
        })}%`,
        percent: cpuPercent,
        barClass: 'bg-blue-500',
    },
    {
        label: 'Disque',
        value: `${formatBytes(liveStats.diskBytes)} / ${formatBytes(
            diskLimitBytes,
        )}`,
        percent: diskPercent,
        barClass: 'bg-orange-500',
    },
    {
        label: 'Réseau entrant',
        value: formatBytes(liveStats.networkRxBytes),
        percent: 0,
        barClass: 'bg-cyan-500',
    },
    {
        label: 'Réseau sortant',
        value: formatBytes(liveStats.networkTxBytes),
        percent: 0,
        barClass: 'bg-violet-500',
    },
    {
        label: 'Uptime',
        value: formatUptime(liveStats.uptimeMs),
        percent: 0,
        barClass: 'bg-pink-500',
    },
];

function formatRam(value?:number){

    if(!value) return "—";

    return `${value/1024} Go`;

}

function formatDisk(value?:number){

    if(!value) return "—";

    return `${value/1024} Go`;

}

    const actionsDisabled =
        service.provider !== 'pterodactyl' ||
        service.status !== 'active';

    const serverAddress = allocation?.port && (allocation.alias || allocation.ip)
        ? `${allocation.alias ?? allocation.ip}:${allocation.port}`
        : 'En attente';

    const panelItems = [
        { id: 'console', label: 'Console', icon: TerminalSquare },
        { id: 'files', label: 'Fichiers', icon: FolderOpen },
        { id: 'databases', label: 'Bases de données', icon: Database },
        { id: 'schedules', label: 'Planificateur', icon: Activity },
        { id: 'backups', label: 'Sauvegardes', icon: HardDrive },
        { id: 'network', label: 'Réseau', icon: Network },
        { id: 'startup', label: 'Démarrage', icon: CloudCog },
        { id: 'users', label: 'Utilisateurs', icon: Users },
        { id: 'settings', label: 'Paramètres', icon: Settings },
        { id: 'activity', label: 'Activité', icon: Activity },
        { id: 'api', label: 'API', icon: KeyRound },
    ] as const;

    return (
        <>
            <Head title={`${service.name} — Panel Astreon`} />

            <div className="astreon-ptero-page">
                <header className="astreon-ptero-globalbar">
                    <div className="astreon-ptero-globalbar-inner">
                        <Link href="/client/services" className="astreon-ptero-brand">
                            <span className="astreon-ptero-brand-mark">A</span>
                            <span>Astreon Panel</span>
                        </Link>

                        <div className="astreon-ptero-global-actions">
                            <span className={`astreon-live-dot astreon-live-${serverState}`} />
                            <span>{runtimeStatusLabel(serverState)}</span>
                            <Link href="/client/services" aria-label="Retour aux services">
                                <ChevronLeft />
                            </Link>
                        </div>
                    </div>
                </header>

                <nav className="astreon-ptero-tabs" aria-label="Navigation du serveur">
                    <div className="astreon-ptero-tabs-inner">
                        {panelItems.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setActivePanel(id)}
                                className={activePanel === id ? 'active' : ''}
                            >
                                <Icon />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </nav>

                <main className="astreon-ptero-main">
                    <section className="astreon-ptero-server-head">
                        <div>
                            <h1>{service.name}</h1>
                            <p>{service.order?.reference ?? service.reference} — {service.reference}</p>
                        </div>

                        <div className="astreon-ptero-power">
                            <button type="button" onClick={() => power('start')} disabled={actionsDisabled} className="start">
                                <Play /> Démarrer
                            </button>
                            <button type="button" onClick={() => power('restart')} disabled={actionsDisabled} className="restart">
                                <RefreshCcw /> Redémarrer
                            </button>
                            <button type="button" onClick={() => power('stop')} disabled={actionsDisabled} className="stop">
                                <Square /> Arrêter
                            </button>
                        </div>
                    </section>

                    {activePanel === 'console' ? (
                        <div className="astreon-ptero-console-layout">
                            <section className="astreon-ptero-module astreon-ptero-console">
                                <ServerConsole
                                    lines={consoleLines}
                                    socketState={socketState}
                                    serverState={serverState}
                                    onSendCommand={sendConsoleCommand}
                                    onClear={() => setConsoleLines([])}
                                />
                            </section>

                            <aside className="astreon-ptero-resource-column">
                                <article><Network /><div><span>Adresse</span><strong>{serverAddress}</strong></div></article>
                                <article><Activity /><div><span>Uptime</span><strong>{formatUptime(liveStats.uptimeMs)}</strong></div></article>
                                <article><CircleGauge /><div><span>Charge CPU</span><strong>{liveStats.cpuPercent.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}% / {resources?.cpu_percent ?? 0}%</strong></div></article>
                                <article><Server /><div><span>Mémoire</span><strong>{formatBytes(liveStats.memoryBytes)} / {formatBytes(memoryLimitBytes)}</strong></div></article>
                                <article><HardDrive /><div><span>Disque</span><strong>{formatBytes(liveStats.diskBytes)} / {formatBytes(diskLimitBytes)}</strong></div></article>
                                <article><Activity /><div><span>Réseau entrant</span><strong>{formatBytes(liveStats.networkRxBytes)}</strong></div></article>
                                <article><Activity /><div><span>Réseau sortant</span><strong>{formatBytes(liveStats.networkTxBytes)}</strong></div></article>
                            </aside>
                        </div>
                    ) : (
                        <section className="astreon-ptero-module astreon-ptero-full-module">
                            {activePanel === 'files' && <ServerFiles serviceId={service.id} />}
                            {activePanel === 'backups' && <ServerBackups serviceId={service.id} backupLimit={resources?.backups ?? 0} />}
                            {activePanel === 'databases' && <ServerDatabases serviceId={service.id} databaseLimit={resources?.databases ?? 0} />}
                            {activePanel === 'startup' && <ServerStartup serviceId={service.id} />}
                            {activePanel === 'network' && <ServerNetwork serviceId={service.id} />}
                            {activePanel === 'schedules' && <ServerSchedules serviceId={service.id} />}
                            {activePanel === 'users' && <ServerUsers serviceId={service.id} />}
                            {activePanel === 'settings' && <ServerSettings serviceId={service.id} />}
                            {activePanel === 'activity' && <ServerActivity serviceId={service.id} />}
                            {activePanel === 'api' && <ServerApiKeys serviceId={service.id} />}
                        </section>
                    )}
                </main>
            </div>
        </>
    );

}
