import { FormEvent, useCallback, useEffect, useState } from 'react';

type Backup = {
    uuid: string;
    name: string;
    bytes: number;
    is_successful: boolean;
    is_locked: boolean;
    created_at: string | null;
    completed_at: string | null;
};

type Props = {
    serviceId: number;
    backupLimit: number;
};

const csrf = () =>
    document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.getAttribute('content') ?? '';

const formatBytes = (value: number): string => {
    if (!Number.isFinite(value) || value <= 0) {
        return '0 o';
    }

    const units = ['o', 'Ko', 'Mo', 'Go', 'To'];
    const index = Math.min(
        Math.floor(Math.log(value) / Math.log(1024)),
        units.length - 1,
    );

    return `${(value / 1024 ** index).toLocaleString('fr-FR', {
        maximumFractionDigits: 2,
    })} ${units[index]}`;
};

const formatDate = (value: string | null): string => {
    if (!value) {
        return 'En cours';
    }

    return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
};

export default function ServerBackups({
    serviceId,
    backupLimit,
}: Props) {
    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [busyBackup, setBusyBackup] = useState<string | null>(
        null,
    );
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const api = useCallback(
        async (
            path: string,
            options: RequestInit = {},
        ): Promise<any> => {
            const response = await fetch(
                `/client/services/${serviceId}/backups${path}`,
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

    const loadBackups = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const payload = await api('');
            setBackups(payload.backups ?? []);
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
        void loadBackups();
    }, [loadBackups]);

    useEffect(() => {
        const hasPending = backups.some(
            (backup) => backup.completed_at === null,
        );

        if (!hasPending) {
            return;
        }

        const timer = window.setInterval(() => {
            void loadBackups();
        }, 10000);

        return () => {
            window.clearInterval(timer);
        };
    }, [backups, loadBackups]);

    const createBackup = async (event: FormEvent) => {
        event.preventDefault();

        setCreating(true);
        setError('');
        setMessage('');

        try {
            await api('', {
                method: 'POST',
                body: JSON.stringify({
                    name: name.trim() || null,
                }),
            });

            setName('');
            setMessage('Sauvegarde lancée.');
            await loadBackups();
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

    const removeBackup = async (backup: Backup) => {
        if (
            !window.confirm(
                `Supprimer définitivement « ${backup.name} » ?`,
            )
        ) {
            return;
        }

        setBusyBackup(backup.uuid);
        setError('');
        setMessage('');

        try {
            await api(`/${backup.uuid}`, {
                method: 'DELETE',
            });

            setMessage('Sauvegarde supprimée.');
            await loadBackups();
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Suppression impossible.',
            );
        } finally {
            setBusyBackup(null);
        }
    };

    const restoreBackup = async (backup: Backup) => {
        if (
            !window.confirm(
                `Restaurer « ${backup.name} » ? Les fichiers actuels du serveur seront remplacés.`,
            )
        ) {
            return;
        }

        setBusyBackup(backup.uuid);
        setError('');
        setMessage('');

        try {
            await api(`/${backup.uuid}/restore`, {
                method: 'POST',
                body: JSON.stringify({
                    truncate: true,
                }),
            });

            setMessage('Restauration lancée.');
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Restauration impossible.',
            );
        } finally {
            setBusyBackup(null);
        }
    };

    const downloadBackup = async (backup: Backup) => {
        setBusyBackup(backup.uuid);
        setError('');

        try {
            const payload = await api(
                `/${backup.uuid}/download`,
            );

            if (payload.url) {
                window.open(
                    payload.url,
                    '_blank',
                    'noopener,noreferrer',
                );
            }
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Téléchargement impossible.',
            );
        } finally {
            setBusyBackup(null);
        }
    };

    const limitReached =
        backupLimit > 0 && backups.length >= backupLimit;

    return (
        <article className="rounded-3xl border border-white/10 bg-[#070d18] p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-violet-400">
                        Protection
                    </p>

                    <h2 className="mt-2 text-3xl font-black">
                        Sauvegardes
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        {backups.length}
                        {backupLimit > 0
                            ? ` / ${backupLimit}`
                            : ''}{' '}
                        sauvegarde(s)
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void loadBackups()}
                    disabled={loading}
                    className="rounded-xl border border-white/10 px-4 py-2 font-bold hover:bg-white/5 disabled:opacity-50"
                >
                    ↻ Actualiser
                </button>
            </div>

            <form
                onSubmit={createBackup}
                className="mt-6 flex flex-col gap-3 sm:flex-row"
            >
                <input
                    value={name}
                    onChange={(event) =>
                        setName(event.target.value)
                    }
                    maxLength={100}
                    placeholder="Nom de la sauvegarde (facultatif)"
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400/50"
                />

                <button
                    type="submit"
                    disabled={creating || limitReached}
                    className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 font-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {creating
                        ? 'Création...'
                        : '➕ Créer une sauvegarde'}
                </button>
            </form>

            {limitReached && (
                <p className="mt-3 text-sm text-amber-300">
                    La limite de sauvegardes de cette offre est atteinte.
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
                ) : backups.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
                        <p className="text-lg font-black">
                            Aucune sauvegarde
                        </p>

                        <p className="mt-2 text-sm text-slate-400">
                            Crée ta première sauvegarde avant une mise à
                            jour importante.
                        </p>
                    </div>
                ) : (
                    backups.map((backup) => {
                        const pending =
                            backup.completed_at === null;
                        const busy =
                            busyBackup === backup.uuid;

                        return (
                            <div
                                key={backup.uuid}
                                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                            >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <p className="truncate text-lg font-black">
                                                {backup.name}
                                            </p>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-black ${
                                                    pending
                                                        ? 'bg-amber-400/10 text-amber-300'
                                                        : backup.is_successful
                                                          ? 'bg-emerald-400/10 text-emerald-300'
                                                          : 'bg-red-400/10 text-red-300'
                                                }`}
                                            >
                                                {pending
                                                    ? 'En cours'
                                                    : backup.is_successful
                                                      ? 'Terminée'
                                                      : 'Échec'}
                                            </span>

                                            {backup.is_locked && (
                                                <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs font-black text-blue-300">
                                                    Verrouillée
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                                            <span>
                                                Taille :{' '}
                                                {formatBytes(
                                                    backup.bytes,
                                                )}
                                            </span>

                                            <span>
                                                Créée :{' '}
                                                {formatDate(
                                                    backup.created_at,
                                                )}
                                            </span>

                                            <span>
                                                Terminée :{' '}
                                                {formatDate(
                                                    backup.completed_at,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void downloadBackup(
                                                    backup,
                                                )
                                            }
                                            disabled={
                                                busy ||
                                                pending ||
                                                !backup.is_successful
                                            }
                                            className="rounded-xl border border-white/10 px-4 py-2 font-bold hover:bg-white/5 disabled:opacity-40"
                                        >
                                            ⬇ Télécharger
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                void restoreBackup(
                                                    backup,
                                                )
                                            }
                                            disabled={
                                                busy ||
                                                pending ||
                                                !backup.is_successful
                                            }
                                            className="rounded-xl border border-amber-400/20 px-4 py-2 font-bold text-amber-300 hover:bg-amber-400/10 disabled:opacity-40"
                                        >
                                            ♻ Restaurer
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                void removeBackup(
                                                    backup,
                                                )
                                            }
                                            disabled={
                                                busy ||
                                                backup.is_locked
                                            }
                                            className="rounded-xl border border-red-400/20 px-4 py-2 font-bold text-red-300 hover:bg-red-400/10 disabled:opacity-40"
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