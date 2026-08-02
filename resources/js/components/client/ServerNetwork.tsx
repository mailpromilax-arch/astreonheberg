import { useCallback, useEffect, useMemo, useState } from 'react';

type Allocation = {
    id: number;
    ip: string;
    ip_alias: string | null;
    port: number;
    notes: string;
    is_default: boolean;
};

type Props = {
    serviceId: number;
};

const csrf = () =>
    document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.getAttribute('content') ?? '';

const address = (allocation: Allocation): string =>
    `${allocation.ip_alias || allocation.ip}:${allocation.port}`;

const suggestedUsage = (port: number): string => {
    const known: Record<number, string> = {
        19132: 'Minecraft Bedrock',
        25565: 'Minecraft Java',
        25575: 'RCON Minecraft',
        30120: 'FiveM',
        9987: 'TeamSpeak Voice',
        10011: 'TeamSpeak Query',
        27015: 'Source / CS2',
        27020: 'SourceTV',
        7777: 'ARK / Jeu',
        7778: 'ARK Peer',
        27016: 'ARK Query',
    };

    return known[port] ?? 'Port secondaire';
};

export default function ServerNetwork({ serviceId }: Props) {
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [notes, setNotes] = useState<Record<number, string>>({});
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const api = useCallback(
        async (
            path: string,
            options: RequestInit = {},
        ): Promise<any> => {
            const response = await fetch(
                `/client/services/${serviceId}/network${path}`,
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

    const load = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const payload = await api('');
            const received = (payload.allocations ?? []) as Allocation[];

            setAllocations(received);
            setNotes(
                Object.fromEntries(
                    received.map((allocation) => [
                        allocation.id,
                        allocation.notes || '',
                    ]),
                ),
            );
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

    const primary = useMemo(
        () => allocations.find((allocation) => allocation.is_default),
        [allocations],
    );

    const copy = async (value: string, label: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setMessage(`${label} copié.`);
            window.setTimeout(() => setMessage(''), 2200);
        } catch {
            setError('Impossible de copier dans le presse-papiers.');
        }
    };

    const createAllocation = async () => {
        setCreating(true);
        setError('');
        setMessage('');

        try {
            await api('', {
                method: 'POST',
                body: JSON.stringify({}),
            });

            setMessage('Nouveau port attribué.');
            await load();
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Attribution impossible.',
            );
        } finally {
            setCreating(false);
        }
    };

    const setPrimary = async (allocation: Allocation) => {
        if (
            !window.confirm(
                `Définir ${address(allocation)} comme adresse principale ?`,
            )
        ) {
            return;
        }

        setBusyId(allocation.id);
        setError('');
        setMessage('');

        try {
            await api(`/${allocation.id}/primary`, {
                method: 'POST',
                body: JSON.stringify({}),
            });

            setMessage('Port principal modifié.');
            await load();
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Modification impossible.',
            );
        } finally {
            setBusyId(null);
        }
    };

    const saveNote = async (allocation: Allocation) => {
        setBusyId(allocation.id);
        setError('');
        setMessage('');

        try {
            await api(`/${allocation.id}/note`, {
                method: 'PUT',
                body: JSON.stringify({
                    notes: notes[allocation.id] ?? '',
                }),
            });

            setEditingId(null);
            setMessage('Description enregistrée.');
            await load();
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Enregistrement impossible.',
            );
        } finally {
            setBusyId(null);
        }
    };

    const remove = async (allocation: Allocation) => {
        if (
            allocation.is_default ||
            !window.confirm(
                `Supprimer le port ${address(allocation)} ?`,
            )
        ) {
            return;
        }

        setBusyId(allocation.id);
        setError('');
        setMessage('');

        try {
            await api(`/${allocation.id}`, {
                method: 'DELETE',
            });

            setMessage('Port supprimé.');
            await load();
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Suppression impossible.',
            );
        } finally {
            setBusyId(null);
        }
    };

    return (
        <article className="min-w-0 rounded-3xl border border-white/10 bg-[#070d18] p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-400">
                        Connectivité
                    </p>

                    <h2 className="mt-2 text-3xl font-black">
                        Réseau et ports
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        Gère les adresses attribuées à ton serveur.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => void load()}
                        disabled={loading}
                        className="rounded-xl border border-white/10 px-4 py-2 font-bold hover:bg-white/5 disabled:opacity-50"
                    >
                        ↻ Actualiser
                    </button>

                    <button
                        type="button"
                        onClick={() => void createAllocation()}
                        disabled={creating}
                        className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2 font-black disabled:opacity-40"
                    >
                        {creating ? 'Attribution...' : '＋ Nouveau port'}
                    </button>
                </div>
            </div>

            {primary && (
                <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 to-cyan-400/5 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                        Adresse principale
                    </p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="break-all font-mono text-xl font-black sm:text-2xl">
                                {address(primary)}
                            </p>
                            <p className="mt-2 text-sm text-slate-400">
                                {primary.notes ||
                                    suggestedUsage(primary.port)}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                void copy(
                                    address(primary),
                                    'Adresse principale',
                                )
                            }
                            className="rounded-xl border border-emerald-400/20 px-4 py-3 font-black text-emerald-300 hover:bg-emerald-400/10"
                        >
                            📋 Copier
                        </button>
                    </div>
                </div>
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
                    <div className="rounded-2xl border border-white/10 p-10 text-center text-slate-400">
                        Chargement...
                    </div>
                ) : allocations.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-slate-400">
                        Aucun port attribué.
                    </div>
                ) : (
                    allocations.map((allocation) => {
                        const busy = busyId === allocation.id;
                        const editing = editingId === allocation.id;

                        return (
                            <div
                                key={allocation.id}
                                className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                            >
                                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <p className="break-all font-mono text-lg font-black">
                                                {address(allocation)}
                                            </p>

                                            {allocation.is_default && (
                                                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
                                                    Principal
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                                                <p className="text-xs text-slate-500">
                                                    IP réelle
                                                </p>
                                                <p className="mt-1 break-all font-mono text-sm font-bold">
                                                    {allocation.ip}
                                                </p>
                                            </div>

                                            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                                                <p className="text-xs text-slate-500">
                                                    Alias
                                                </p>
                                                <p className="mt-1 break-all font-mono text-sm font-bold">
                                                    {allocation.ip_alias || '—'}
                                                </p>
                                            </div>

                                            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                                                <p className="text-xs text-slate-500">
                                                    Usage
                                                </p>
                                                <p className="mt-1 text-sm font-bold">
                                                    {allocation.notes ||
                                                        suggestedUsage(
                                                            allocation.port,
                                                        )}
                                                </p>
                                            </div>
                                        </div>

                                        {editing && (
                                            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                                <input
                                                    value={
                                                        notes[
                                                            allocation.id
                                                        ] ?? ''
                                                    }
                                                    onChange={(event) =>
                                                        setNotes(
                                                            (current) => ({
                                                                ...current,
                                                                [allocation.id]:
                                                                    event.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    maxLength={64}
                                                    placeholder="Ex. RCON, Query, Voice..."
                                                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-400/50"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void saveNote(
                                                            allocation,
                                                        )
                                                    }
                                                    disabled={busy}
                                                    className="rounded-xl bg-emerald-500 px-5 py-3 font-black disabled:opacity-40"
                                                >
                                                    Enregistrer
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void copy(
                                                    address(allocation),
                                                    'Adresse',
                                                )
                                            }
                                            className="rounded-xl border border-white/10 px-4 py-2 font-bold hover:bg-white/5"
                                        >
                                            📋 Copier
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditingId(
                                                    editing
                                                        ? null
                                                        : allocation.id,
                                                )
                                            }
                                            className="rounded-xl border border-cyan-400/20 px-4 py-2 font-bold text-cyan-300 hover:bg-cyan-400/10"
                                        >
                                            ✏ Description
                                        </button>

                                        {!allocation.is_default && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void setPrimary(
                                                            allocation,
                                                        )
                                                    }
                                                    disabled={busy}
                                                    className="rounded-xl border border-emerald-400/20 px-4 py-2 font-bold text-emerald-300 hover:bg-emerald-400/10 disabled:opacity-40"
                                                >
                                                    ★ Principal
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void remove(
                                                            allocation,
                                                        )
                                                    }
                                                    disabled={busy}
                                                    className="rounded-xl border border-red-400/20 px-4 py-2 font-bold text-red-300 hover:bg-red-400/10 disabled:opacity-40"
                                                >
                                                    🗑 Supprimer
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-6 rounded-2xl border border-amber-400/15 bg-amber-400/[0.05] p-4 text-sm text-slate-400">
                Un nouveau port ne peut être attribué que si le serveur
                possède une limite d’allocations supérieure à zéro et si
                le nœud dispose encore de ports libres.
            </div>
        </article>
    );
}
