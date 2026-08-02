type HistoryPoint = {
    timestamp: number;
    memoryBytes: number;
    cpuPercent: number;
    diskBytes: number;
    networkRxBytes: number;
    networkTxBytes: number;
};

type Props = {
    serviceName: string;
    reference: string;
    provider: string;
    serverState: string;
    socketState: string;
    address: string;
    expiresAt: string | null;
    playersLimit: number;
    memoryLimitBytes: number;
    diskLimitBytes: number;
    stats: {
        memoryBytes: number;
        cpuPercent: number;
        diskBytes: number;
        networkRxBytes: number;
        networkTxBytes: number;
        uptimeMs: number;
    };
    history: HistoryPoint[];
};

const bytes = (value: number): string => {
    if (!Number.isFinite(value) || value <= 0) return '0 o';

    const units = ['o', 'Ko', 'Mo', 'Go', 'To'];
    const index = Math.min(
        Math.floor(Math.log(value) / Math.log(1024)),
        units.length - 1,
    );

    return `${(value / 1024 ** index).toLocaleString('fr-FR', {
        maximumFractionDigits: index === 0 ? 0 : 2,
    })} ${units[index]}`;
};

const uptime = (value: number): string => {
    if (!Number.isFinite(value) || value <= 0) return '—';

    const seconds = Math.floor(value / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days} j ${hours} h`;
    if (hours > 0) return `${hours} h ${minutes} min`;
    return `${minutes} min`;
};

const percent = (value: number, limit: number): number => {
    if (!Number.isFinite(value) || !Number.isFinite(limit) || limit <= 0) {
        return 0;
    }

    return Math.max(0, Math.min(100, (value / limit) * 100));
};

const stateLabel = (state: string): string => {
    const labels: Record<string, string> = {
        running: 'En ligne',
        starting: 'Démarrage',
        stopping: 'Arrêt en cours',
        offline: 'Arrêté',
        installing: 'Installation',
        suspended: 'Suspendu',
        unknown: 'Inconnu',
    };

    return labels[state] ?? state;
};

const stateClasses = (state: string): string => {
    if (state === 'running') {
        return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300';
    }

    if (state === 'starting' || state === 'installing') {
        return 'border-amber-400/20 bg-amber-400/10 text-amber-300';
    }

    if (state === 'offline' || state === 'stopping') {
        return 'border-slate-400/20 bg-slate-400/10 text-slate-300';
    }

    return 'border-red-400/20 bg-red-400/10 text-red-300';
};

function Sparkline({
    values,
}: {
    values: number[];
}) {
    const width = 560;
    const height = 150;
    const safeValues = values.length > 1 ? values : [0, 0];
    const maximum = Math.max(...safeValues, 1);
    const minimum = Math.min(...safeValues, 0);
    const range = Math.max(maximum - minimum, 1);

    const points = safeValues
        .map((value, index) => {
            const x =
                (index / Math.max(safeValues.length - 1, 1)) * width;
            const y =
                height -
                ((value - minimum) / range) * (height - 18) -
                9;

            return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ');

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-36 w-full"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <defs>
                <linearGradient
                    id="astreonChartFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                >
                    <stop
                        offset="0%"
                        stopColor="currentColor"
                        stopOpacity="0.24"
                    />
                    <stop
                        offset="100%"
                        stopColor="currentColor"
                        stopOpacity="0"
                    />
                </linearGradient>
            </defs>

            <line
                x1="0"
                y1="40"
                x2={width}
                y2="40"
                stroke="currentColor"
                strokeOpacity="0.08"
            />
            <line
                x1="0"
                y1="82"
                x2={width}
                y2="82"
                stroke="currentColor"
                strokeOpacity="0.08"
            />
            <line
                x1="0"
                y1="124"
                x2={width}
                y2="124"
                stroke="currentColor"
                strokeOpacity="0.08"
            />

            <polygon
                points={`0,${height} ${points} ${width},${height}`}
                fill="url(#astreonChartFill)"
            />

            <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function MetricCard({
    label,
    value,
    detail,
    current,
    limit,
    accent,
}: {
    label: string;
    value: string;
    detail: string;
    current?: number;
    limit?: number;
    accent: string;
}) {
    const usage =
        current !== undefined && limit !== undefined
            ? percent(current, limit)
            : null;

    return (
        <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-400">
                    {label}
                </p>

                <span
                    className={`h-2.5 w-2.5 rounded-full ${accent}`}
                />
            </div>

            <p className="mt-4 break-words text-2xl font-black">
                {value}
            </p>

            <p className="mt-1 text-xs text-slate-500">
                {detail}
            </p>

            {usage !== null && (
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${accent}`}
                        style={{ width: `${usage}%` }}
                    />
                </div>
            )}
        </div>
    );
}

function ChartCard({
    title,
    value,
    subtitle,
    values,
    className,
}: {
    title: string;
    value: string;
    subtitle: string;
    values: number[];
    className: string;
}) {
    return (
        <div className={`min-w-0 rounded-2xl border border-white/10 bg-black/20 p-5 ${className}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-bold text-slate-400">
                        {title}
                    </p>
                    <p className="mt-2 text-2xl font-black">
                        {value}
                    </p>
                </div>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
                    Temps réel
                </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">
                {subtitle}
            </p>

            <div className="mt-4">
                <Sparkline values={values} />
            </div>
        </div>
    );
}

export default function ServerOverview({
    serviceName,
    reference,
    provider,
    serverState,
    socketState,
    address,
    expiresAt,
    playersLimit,
    memoryLimitBytes,
    diskLimitBytes,
    stats,
    history,
}: Props) {
    const memoryUsage = percent(
        stats.memoryBytes,
        memoryLimitBytes,
    );
    const diskUsage = percent(
        stats.diskBytes,
        diskLimitBytes,
    );

    const cpuHistory = history.map((point) => point.cpuPercent);
    const memoryHistory = history.map((point) =>
        percent(point.memoryBytes, memoryLimitBytes),
    );
    const networkHistory = history.map(
        (point) => point.networkRxBytes + point.networkTxBytes,
    );

    const expiration = expiresAt
        ? new Intl.DateTimeFormat('fr-FR', {
              dateStyle: 'long',
          }).format(new Date(expiresAt))
        : 'Illimitée';

    return (
        <section className="space-y-6">
            <article className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0d1d35] via-[#091524] to-[#06101d]">
                <div className="relative p-6 sm:p-8">
                    <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

                    <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                                <span
                                    className={`rounded-full border px-3 py-1 text-xs font-black ${stateClasses(
                                        serverState,
                                    )}`}
                                >
                                    {stateLabel(serverState)}
                                </span>

                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
                                    {socketState}
                                </span>
                            </div>

                            <p className="mt-5 text-sm font-black uppercase tracking-[0.25em] text-cyan-400">
                                Vue d’ensemble
                            </p>

                            <h2 className="mt-2 truncate text-3xl font-black sm:text-4xl">
                                {serviceName}
                            </h2>

                            <p className="mt-3 break-all text-sm text-slate-400">
                                {reference}
                            </p>
                        </div>

                        <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:w-[430px]">
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                <p className="text-xs uppercase tracking-wider text-slate-500">
                                    Adresse
                                </p>
                                <p className="mt-2 break-all font-mono text-sm font-black text-cyan-300">
                                    {address}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                <p className="text-xs uppercase tracking-wider text-slate-500">
                                    Fournisseur
                                </p>
                                <p className="mt-2 text-sm font-black">
                                    {provider}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <MetricCard
                    label="Mémoire"
                    value={`${bytes(stats.memoryBytes)} / ${bytes(
                        memoryLimitBytes,
                    )}`}
                    detail={`${memoryUsage.toLocaleString('fr-FR', {
                        maximumFractionDigits: 1,
                    })}% utilisé`}
                    current={stats.memoryBytes}
                    limit={memoryLimitBytes}
                    accent="bg-emerald-500"
                />

                <MetricCard
                    label="Processeur"
                    value={`${stats.cpuPercent.toLocaleString('fr-FR', {
                        maximumFractionDigits: 1,
                    })}%`}
                    detail="Utilisation instantanée"
                    current={stats.cpuPercent}
                    limit={100}
                    accent="bg-blue-500"
                />

                <MetricCard
                    label="Stockage"
                    value={`${bytes(stats.diskBytes)} / ${bytes(
                        diskLimitBytes,
                    )}`}
                    detail={`${diskUsage.toLocaleString('fr-FR', {
                        maximumFractionDigits: 1,
                    })}% utilisé`}
                    current={stats.diskBytes}
                    limit={diskLimitBytes}
                    accent="bg-orange-500"
                />

                <MetricCard
                    label="Réseau entrant"
                    value={bytes(stats.networkRxBytes)}
                    detail="Depuis le dernier relevé Wings"
                    accent="bg-cyan-500"
                />

                <MetricCard
                    label="Réseau sortant"
                    value={bytes(stats.networkTxBytes)}
                    detail="Depuis le dernier relevé Wings"
                    accent="bg-violet-500"
                />

                <MetricCard
                    label="Disponibilité"
                    value={uptime(stats.uptimeMs)}
                    detail={`Expiration : ${expiration}`}
                    accent="bg-pink-500"
                />
            </div>

            <div className="grid gap-5 xl:grid-cols-3">
                <ChartCard
                    title="CPU"
                    value={`${stats.cpuPercent.toLocaleString('fr-FR', {
                        maximumFractionDigits: 1,
                    })}%`}
                    subtitle="Historique de la session"
                    values={cpuHistory}
                    className="text-blue-400"
                />

                <ChartCard
                    title="RAM"
                    value={`${memoryUsage.toLocaleString('fr-FR', {
                        maximumFractionDigits: 1,
                    })}%`}
                    subtitle={`${bytes(stats.memoryBytes)} consommés`}
                    values={memoryHistory}
                    className="text-emerald-400"
                />

                <ChartCard
                    title="Activité réseau"
                    value={bytes(
                        stats.networkRxBytes + stats.networkTxBytes,
                    )}
                    subtitle="Entrant et sortant cumulés"
                    values={networkHistory}
                    className="text-cyan-400"
                />
            </div>

            <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.22em] text-violet-400">
                            Informations
                        </p>
                        <h3 className="mt-2 text-2xl font-black">
                            Résumé du service
                        </h3>
                    </div>

                    <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-400">
                        {playersLimit} joueur(s) maximum
                    </span>
                </div>

                <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <dt className="text-xs uppercase tracking-wider text-slate-500">
                            État du serveur
                        </dt>
                        <dd className="mt-2 font-black">
                            {stateLabel(serverState)}
                        </dd>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <dt className="text-xs uppercase tracking-wider text-slate-500">
                            Console
                        </dt>
                        <dd className="mt-2 font-black">
                            {socketState}
                        </dd>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <dt className="text-xs uppercase tracking-wider text-slate-500">
                            Adresse publique
                        </dt>
                        <dd className="mt-2 break-all font-mono text-sm font-black">
                            {address}
                        </dd>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <dt className="text-xs uppercase tracking-wider text-slate-500">
                            Expiration
                        </dt>
                        <dd className="mt-2 font-black">
                            {expiration}
                        </dd>
                    </div>
                </dl>
            </article>
        </section>
    );
}
