import { FormEvent, useCallback, useEffect, useState } from 'react';

type ApiKeyItem = {
    id: number;
    name: string;
    token_prefix: string;
    permissions: string[];
    last_used_at: string | null;
    expires_at: string | null;
    revoked_at: string | null;
    created_at: string | null;
    is_usable: boolean;
};

type Props = {
    serviceId: number;
};

const permissionLabels: Record<string, string> = {
    'server.read': 'Informations du serveur',
    'resources.read': 'Ressources en temps réel',
    'power.write': 'Démarrer, arrêter et redémarrer',
    'console.write': 'Envoyer des commandes console',
};

const csrf = () =>
    document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.getAttribute('content') ?? '';

const formatDate = (value: string | null): string => {
    if (!value) return 'Jamais';

    return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
};

export default function ServerApiKeys({ serviceId }: Props) {
    const [keys, setKeys] = useState<ApiKeyItem[]>([]);
    const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
    const [baseUrl, setBaseUrl] = useState('');
    const [name, setName] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [permissions, setPermissions] = useState<string[]>([
        'server.read',
        'resources.read',
    ]);
    const [newToken, setNewToken] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const api = useCallback(
        async (path: string, options: RequestInit = {}): Promise<any> => {
            const response = await fetch(
                `/client/services/${serviceId}/api-keys${path}`,
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
                    payload.message ?? `Erreur HTTP ${response.status}`,
                );
            }

            return payload;
        },
        [serviceId],
    );

    const load = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const payload = await api('');
            setKeys(payload.keys ?? []);
            setAvailablePermissions(payload.available_permissions ?? []);
            setBaseUrl(payload.base_url ?? '');
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
        void load();
    }, [load]);

    const togglePermission = (permission: string) => {
        setPermissions((current) =>
            current.includes(permission)
                ? current.filter((item) => item !== permission)
                : [...current, permission],
        );
    };

    const createKey = async (event: FormEvent) => {
        event.preventDefault();
        setBusy(true);
        setError('');
        setMessage('');
        setNewToken('');

        try {
            const payload = await api('', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    permissions,
                    expires_at: expiresAt || null,
                }),
            });

            setNewToken(payload.token ?? '');
            setName('');
            setExpiresAt('');
            setPermissions(['server.read', 'resources.read']);
            setShowCreate(false);
            setMessage(
                'Clé créée. Copie-la maintenant : elle ne sera plus affichée.',
            );
            await load();
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Création impossible.',
            );
        } finally {
            setBusy(false);
        }
    };

    const revoke = async (key: ApiKeyItem) => {
        if (!window.confirm(`Révoquer la clé « ${key.name} » ?`)) return;

        setBusy(true);
        setError('');

        try {
            await api(`/${key.id}`, {
                method: 'DELETE',
            });

            setMessage('Clé révoquée.');
            await load();
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Révocation impossible.',
            );
        } finally {
            setBusy(false);
        }
    };

    const copy = async (value: string) => {
        await navigator.clipboard.writeText(value);
        setMessage('Copié dans le presse-papiers.');
    };

    return (
        <article className="min-w-0 rounded-3xl border border-white/10 bg-[#070d18] p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-400">
                        Automatisation
                    </p>
                    <h2 className="mt-2 text-3xl font-black">
                        Clés API Astreon
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Pilote ce serveur depuis un bot, un script ou une application.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowCreate((current) => !current)}
                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 font-black"
                >
                    ＋ Nouvelle clé
                </button>
            </div>

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

            {newToken && (
                <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/[0.07] p-5">
                    <p className="font-black text-amber-300">
                        Copie cette clé maintenant
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                        Pour ta sécurité, le jeton complet ne sera plus jamais affiché.
                    </p>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <code className="min-w-0 flex-1 break-all rounded-xl bg-black/30 p-4 text-sm text-amber-200">
                            {newToken}
                        </code>
                        <button
                            type="button"
                            onClick={() => void copy(newToken)}
                            className="rounded-xl bg-amber-500 px-5 py-3 font-black text-black"
                        >
                            📋 Copier
                        </button>
                    </div>
                </div>
            )}

            {showCreate && (
                <form
                    onSubmit={createKey}
                    className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-5"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <label>
                            <span className="text-sm text-slate-400">
                                Nom de la clé
                            </span>
                            <input
                                required
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Bot Discord"
                                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-400/50"
                            />
                        </label>

                        <label>
                            <span className="text-sm text-slate-400">
                                Expiration facultative
                            </span>
                            <input
                                type="datetime-local"
                                value={expiresAt}
                                onChange={(event) =>
                                    setExpiresAt(event.target.value)
                                }
                                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-400/50"
                            />
                        </label>
                    </div>

                    <div className="mt-5">
                        <p className="text-sm font-black">
                            Permissions
                        </p>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {availablePermissions.map((permission) => (
                                <label
                                    key={permission}
                                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-4"
                                >
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes(permission)}
                                        onChange={() =>
                                            togglePermission(permission)
                                        }
                                        className="mt-1"
                                    />

                                    <span>
                                        <span className="block font-bold">
                                            {permissionLabels[permission] ?? permission}
                                        </span>
                                        <code className="mt-1 block text-xs text-cyan-300">
                                            {permission}
                                        </code>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={busy || permissions.length === 0}
                        className="mt-5 rounded-xl bg-cyan-500 px-6 py-3 font-black disabled:opacity-40"
                    >
                        {busy ? 'Création...' : 'Créer la clé'}
                    </button>
                </form>
            )}

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                    URL de base
                </p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <code className="min-w-0 flex-1 break-all text-cyan-300">
                        {baseUrl || '—'}
                    </code>
                    {baseUrl && (
                        <button
                            type="button"
                            onClick={() => void copy(baseUrl)}
                            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-bold"
                        >
                            Copier
                        </button>
                    )}
                </div>

                <pre className="mt-5 overflow-auto rounded-xl bg-[#020406] p-4 text-xs leading-6 text-slate-300">
{`curl -H "Authorization: Bearer VOTRE_CLE" \\
  ${baseUrl || 'https://votre-site/api/v1/server'}`}
                </pre>
            </div>

            <div className="mt-6 space-y-4">
                {loading ? (
                    <div className="rounded-2xl border border-white/10 p-10 text-center text-slate-400">
                        Chargement...
                    </div>
                ) : keys.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
                        <p className="text-lg font-black">
                            Aucune clé API
                        </p>
                        <p className="mt-2 text-sm text-slate-400">
                            Crée une clé pour automatiser ce serveur.
                        </p>
                    </div>
                ) : (
                    keys.map((key) => (
                        <div
                            key={key.id}
                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                        >
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-xl font-black">
                                            {key.name}
                                        </h3>
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-black ${
                                                key.is_usable
                                                    ? 'bg-emerald-400/10 text-emerald-300'
                                                    : 'bg-red-400/10 text-red-300'
                                            }`}
                                        >
                                            {key.is_usable ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <code className="mt-2 block text-sm text-slate-500">
                                        astreon_{key.token_prefix}_••••••••••••
                                    </code>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {key.permissions.map((permission) => (
                                            <span
                                                key={permission}
                                                className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-cyan-300"
                                            >
                                                {permissionLabels[permission] ?? permission}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                                        <div>
                                            <p className="text-slate-500">Créée</p>
                                            <p className="mt-1 font-bold">
                                                {formatDate(key.created_at)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Dernière utilisation</p>
                                            <p className="mt-1 font-bold">
                                                {formatDate(key.last_used_at)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Expiration</p>
                                            <p className="mt-1 font-bold">
                                                {key.expires_at
                                                    ? formatDate(key.expires_at)
                                                    : 'Jamais'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {key.is_usable && (
                                    <button
                                        type="button"
                                        disabled={busy}
                                        onClick={() => void revoke(key)}
                                        className="rounded-xl border border-red-400/20 px-4 py-2 font-bold text-red-300 hover:bg-red-400/10 disabled:opacity-40"
                                    >
                                        Révoquer
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </article>
    );
}
