import { FormEvent, useCallback, useEffect, useState } from 'react';

type Database = {
    id: string;
    host: {
        address: string;
        port: number;
    };
    name: string;
    username: string;
    connections_from: string;
    max_connections?: number;
    password?: string | null;
};

type Props = {
    serviceId: number;
    databaseLimit: number;
};

const csrf = () =>
    document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.getAttribute('content') ?? '';

const phpMyAdminUrl = String(
    import.meta.env.VITE_PHPMYADMIN_URL ?? '',
).replace(/\/$/, '');

const publicDatabaseHost = String(
    import.meta.env.VITE_DATABASE_PUBLIC_HOST ?? '',
).trim();

export default function ServerDatabases({
    serviceId,
    databaseLimit,
}: Props) {
    const [databases, setDatabases] = useState<Database[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [busyDatabase, setBusyDatabase] = useState<string | null>(
        null,
    );
    const [databaseName, setDatabaseName] = useState('');
    const [remote, setRemote] = useState('%');
    const [revealedPasswords, setRevealedPasswords] = useState<
        Record<string, string>
    >({});
    const [visiblePasswords, setVisiblePasswords] = useState<
        Record<string, boolean>
    >({});
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const api = useCallback(
        async (
            path: string,
            options: RequestInit = {},
        ): Promise<any> => {
            const response = await fetch(
                `/client/services/${serviceId}/databases${path}`,
                {
                    credentials: 'same-origin',
                    ...options,
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': csrf(),
                        ...(options.headers ?? {}),
                    },
                },
            );

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    payload.message ??
                        `Erreur HTTP ${response.status}`,
                );
            }

            return payload;
        },
        [serviceId],
    );

    const loadDatabases = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const payload = await api('');
            setDatabases(payload.databases ?? []);
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Chargement impossible.',
            );
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        void loadDatabases();
    }, [loadDatabases]);

    const createDatabase = async (event: FormEvent) => {
        event.preventDefault();

        setCreating(true);
        setError('');
        setMessage('');

        try {
            const payload = await api('', {
                method: 'POST',
                body: JSON.stringify({
                    database: databaseName.trim(),
                    remote: remote.trim() || '%',
                }),
            });

            const created = payload.database as Database | undefined;

            if (created?.id && created.password) {
                setRevealedPasswords((current) => ({
                    ...current,
                    [created.id]: created.password ?? '',
                }));
            }

            setDatabaseName('');
            setRemote('%');
            setMessage('Base de données créée.');
            await loadDatabases();
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Création impossible.',
            );
        } finally {
            setCreating(false);
        }
    };

    const rotatePassword = async (database: Database) => {
        if (
            !window.confirm(
                `Générer un nouveau mot de passe pour « ${database.name} » ? L’ancien mot de passe cessera de fonctionner.`,
            )
        ) {
            return;
        }

        setBusyDatabase(database.id);
        setError('');
        setMessage('');

        try {
            const payload = await api(
                `/${encodeURIComponent(database.id)}/password`,
                {
                    method: 'POST',
                    body: JSON.stringify({}),
                },
            );

            const newPassword = String(payload.password ?? '');

            if (!newPassword) {
                throw new Error(
                    'Pterodactyl n’a pas renvoyé le nouveau mot de passe.',
                );
            }

            setRevealedPasswords((current) => ({
                ...current,
                [database.id]: newPassword,
            }));

            setVisiblePasswords((current) => ({
                ...current,
                [database.id]: true,
            }));

            setMessage(
                'Nouveau mot de passe généré et affiché. Copie-le maintenant.',
            );
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Rotation impossible.',
            );
        } finally {
            setBusyDatabase(null);
        }
    };

    const deleteDatabase = async (database: Database) => {
        if (
            !window.confirm(
                `Supprimer définitivement « ${database.name} » et toutes ses données ?`,
            )
        ) {
            return;
        }

        setBusyDatabase(database.id);
        setError('');
        setMessage('');

        try {
            await api(`/${encodeURIComponent(database.id)}`, {
                method: 'DELETE',
            });

            setMessage('Base de données supprimée.');
            await loadDatabases();
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Suppression impossible.',
            );
        } finally {
            setBusyDatabase(null);
        }
    };

    const copy = async (value: string, label: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setMessage(`${label} copié.`);

            window.setTimeout(() => {
                setMessage('');
            }, 2500);
        } catch {
            setError('Impossible de copier dans le presse-papiers.');
        }
    };

    const togglePassword = (databaseId: string) => {
        setVisiblePasswords((current) => ({
            ...current,
            [databaseId]: !current[databaseId],
        }));
    };

    const limitReached =
        databaseLimit > 0 && databases.length >= databaseLimit;

    return (
        <article className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[#070d18] p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-400">
                        Données
                    </p>

                    <h2 className="mt-2 text-3xl font-black">
                        Bases de données
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        {databases.length}
                        {databaseLimit > 0
                            ? ` / ${databaseLimit}`
                            : ''}{' '}
                        base(s)
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void loadDatabases()}
                    disabled={loading}
                    className="rounded-xl border border-white/10 px-4 py-2 font-bold hover:bg-white/5 disabled:opacity-50"
                >
                    ↻ Actualiser
                </button>
            </div>

            <form
                onSubmit={createDatabase}
                className="mt-6 grid gap-3 lg:grid-cols-[1fr_220px_auto]"
            >
                <input
                    value={databaseName}
                    onChange={(event) =>
                        setDatabaseName(event.target.value)
                    }
                    required
                    maxLength={48}
                    pattern="[A-Za-z0-9_-]+"
                    placeholder="Nom de la base"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-blue-400/50"
                />

                <input
                    value={remote}
                    onChange={(event) =>
                        setRemote(event.target.value)
                    }
                    required
                    maxLength={255}
                    placeholder="Connexions depuis (%)"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-blue-400/50"
                />

                <button
                    type="submit"
                    disabled={creating || limitReached}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {creating
                        ? 'Création...'
                        : '➕ Créer'}
                </button>
            </form>

            <p className="mt-3 text-xs text-slate-500">
                « % » autorise les connexions depuis toutes les adresses.
                Utilise une IP précise pour limiter l’accès.
            </p>

            {limitReached && (
                <p className="mt-3 text-sm text-amber-300">
                    La limite de bases de données de cette offre est
                    atteinte.
                </p>
            )}

            {error && (
                <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            {message && (
                <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                    {message}
                </div>
            )}

            <div className="mt-6 space-y-4">
                {loading ? (
                    <div className="rounded-2xl border border-white/10 p-8 text-center text-slate-400">
                        Chargement...
                    </div>
                ) : databases.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
                        <p className="text-lg font-black">
                            Aucune base de données
                        </p>

                        <p className="mt-2 text-sm text-slate-400">
                            Crée une base pour tes plugins, mods ou
                            ressources.
                        </p>
                    </div>
                ) : (
                    databases.map((database) => {
                        const password =
                            revealedPasswords[database.id] ??
                            database.password ??
                            '';
                        const busy =
                            busyDatabase === database.id;
                        const databaseHost =
                            publicDatabaseHost ||
                            database.host.address;
                        const address = `${databaseHost}:${database.host.port}`;
                        const connectionUri = password
                            ? `mysql://${encodeURIComponent(
                                  database.username,
                              )}:${encodeURIComponent(
                                  password,
                              )}@${databaseHost}:${database.host.port}/${database.name}`
                            : '';
                        const connectionConfig = password
                            ? [
                                  `DB_CONNECTION=mysql`,
                                  `DB_HOST=${databaseHost}`,
                                  `DB_PORT=${database.host.port}`,
                                  `DB_DATABASE=${database.name}`,
                                  `DB_USERNAME=${database.username}`,
                                  `DB_PASSWORD=${password}`,
                              ].join('\n')
                            : '';

                        return (
                            <div
                                key={database.id}
                                className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
                            >
                                <div className="min-w-0 space-y-5">
                                    <div className="min-w-0 w-full">
                                        <p className="truncate text-lg font-black">
                                            {database.name}
                                        </p>

                                        <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    void copy(
                                                        address,
                                                        'Adresse',
                                                    )
                                                }
                                                className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/20 p-4 text-left hover:bg-white/5"
                                            >
                                                <span className="text-xs text-slate-500">
                                                    Hôte
                                                </span>

                                                <span className="mt-1 block min-w-0 break-all font-mono text-sm font-bold leading-6">
                                                    {address}
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    void copy(
                                                        database.username,
                                                        'Utilisateur',
                                                    )
                                                }
                                                className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/20 p-4 text-left hover:bg-white/5"
                                            >
                                                <span className="text-xs text-slate-500">
                                                    Utilisateur
                                                </span>

                                                <span className="mt-1 block min-w-0 break-all font-mono text-sm font-bold leading-6">
                                                    {database.username}
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    void copy(
                                                        database.name,
                                                        'Nom de la base',
                                                    )
                                                }
                                                className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/20 p-4 text-left hover:bg-white/5"
                                            >
                                                <span className="text-xs text-slate-500">
                                                    Base
                                                </span>

                                                <span className="mt-1 block min-w-0 break-all font-mono text-sm font-bold leading-6">
                                                    {database.name}
                                                </span>
                                            </button>

                                            <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/20 p-4">
                                                <span className="text-xs text-slate-500">
                                                    Mot de passe
                                                </span>

                                                <div className="mt-2 flex items-start gap-2">
                                                    <span className="min-w-0 flex-1 break-all font-mono text-sm font-bold leading-6">
                                                        {password
                                                            ? visiblePasswords[
                                                                  database.id
                                                              ]
                                                                ? password
                                                                : '••••••••••••••••'
                                                            : 'Génère un nouveau mot de passe'}
                                                    </span>

                                                    {password && (
                                                        <div className="flex shrink-0 gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    togglePassword(
                                                                        database.id,
                                                                    )
                                                                }
                                                                className="rounded-lg border border-white/10 px-2 py-1 hover:bg-white/5"
                                                                title={
                                                                    visiblePasswords[
                                                                        database.id
                                                                    ]
                                                                        ? 'Masquer'
                                                                        : 'Afficher'
                                                                }
                                                            >
                                                                {visiblePasswords[
                                                                    database.id
                                                                ]
                                                                    ? '🙈'
                                                                    : '👁'}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    void copy(
                                                                        password,
                                                                        'Mot de passe',
                                                                    )
                                                                }
                                                                className="rounded-lg border border-white/10 px-2 py-1 hover:bg-white/5"
                                                                title="Copier"
                                                            >
                                                                📋
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 min-w-0 overflow-hidden rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04] p-4">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-wider text-cyan-300">
                                                        Connexion MySQL prête à l’emploi
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        À coller dans un plugin, un mod ou une application.
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void copy(
                                                            connectionUri,
                                                            'Lien MySQL',
                                                        )
                                                    }
                                                    disabled={!connectionUri}
                                                    className="rounded-lg border border-cyan-400/20 px-3 py-2 text-xs font-black text-cyan-300 hover:bg-cyan-400/10 disabled:opacity-40"
                                                >
                                                    📋 Copier
                                                </button>
                                            </div>

                                            <code className="mt-3 block max-h-32 w-full overflow-auto whitespace-pre-wrap break-all rounded-lg bg-black/30 p-3 text-xs leading-5 text-slate-300">
                                                {connectionUri ||
                                                    'Génère un nouveau mot de passe pour obtenir le lien complet.'}
                                            </code>
                                        </div>

                                        <p className="mt-3 text-xs text-slate-500">
                                            Connexions autorisées depuis :{' '}
                                            {database.connections_from}
                                        </p>
                                    </div>

                                    <div className="flex w-full flex-wrap gap-2 border-t border-white/10 pt-5">
                                        {phpMyAdminUrl && (
                                            <a
                                                href={phpMyAdminUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-400/20 px-4 py-2 text-center font-bold text-blue-300 hover:bg-blue-400/10"
                                            >
                                                🛠 phpMyAdmin
                                            </a>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                void copy(
                                                    connectionUri,
                                                    'Lien MySQL',
                                                )
                                            }
                                            disabled={!connectionUri}
                                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-cyan-400/20 px-4 py-2 text-center font-bold text-cyan-300 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            🔗 Copier le lien MySQL
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                void copy(
                                                    connectionConfig,
                                                    'Configuration',
                                                )
                                            }
                                            disabled={!connectionConfig}
                                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-400/20 px-4 py-2 text-center font-bold text-emerald-300 hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            📋 Copier la configuration
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                void rotatePassword(
                                                    database,
                                                )
                                            }
                                            disabled={busy}
                                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-400/20 px-4 py-2 text-center font-bold text-amber-300 hover:bg-amber-400/10 disabled:opacity-40"
                                        >
                                            🔑 Nouveau mot de passe
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                void deleteDatabase(
                                                    database,
                                                )
                                            }
                                            disabled={busy}
                                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-red-400/20 px-4 py-2 text-center font-bold text-red-300 hover:bg-red-400/10 disabled:opacity-40"
                                        >
                                            🗑 Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </article>
    );
}