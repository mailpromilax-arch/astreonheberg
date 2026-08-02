import { FormEvent, useCallback, useEffect, useState } from 'react';

type ScheduleTask = {
    id: number;
    sequence_id: number;
    action: 'command' | 'power' | 'backup';
    payload: string;
    time_offset: number;
    continue_on_failure: boolean;
};

type Schedule = {
    id: number;
    name: string;
    cron: {
        minute: string;
        hour: string;
        day_of_month: string;
        month: string;
        day_of_week: string;
    };
    is_active: boolean;
    is_processing: boolean;
    only_when_online: boolean;
    last_run_at: string | null;
    next_run_at: string | null;
    tasks: ScheduleTask[];
};

type Props = {
    serviceId: number;
};

const csrf = () =>
    document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.getAttribute('content') ?? '';

const initialSchedule = {
    name: '',
    minute: '0',
    hour: '4',
    day_of_month: '*',
    month: '*',
    day_of_week: '*',
    is_active: true,
    only_when_online: false,
};

const formatDate = (value: string | null): string => {
    if (!value) return 'Jamais';

    return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
};

const actionLabel = (task: ScheduleTask): string => {
    if (task.action === 'backup') return 'Créer une sauvegarde';
    if (task.action === 'power') return `Alimentation : ${task.payload}`;
    return `Commande : ${task.payload}`;
};

export default function ServerSchedules({ serviceId }: Props) {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [form, setForm] = useState(initialSchedule);
    const [taskForms, setTaskForms] = useState<
        Record<
            number,
            {
                action: 'command' | 'power' | 'backup';
                payload: string;
                time_offset: number;
                continue_on_failure: boolean;
            }
        >
    >({});
    const [showCreate, setShowCreate] = useState(false);
    const [openSchedule, setOpenSchedule] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const api = useCallback(
        async (path: string, options: RequestInit = {}): Promise<any> => {
            const response = await fetch(
                `/client/services/${serviceId}/schedules${path}`,
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
            const received = (payload.schedules ?? []) as Schedule[];

            setSchedules(received);
            setTaskForms((current) => {
                const next = { ...current };

                received.forEach((schedule) => {
                    next[schedule.id] ??= {
                        action: 'command',
                        payload: '',
                        time_offset: 0,
                        continue_on_failure: false,
                    };
                });

                return next;
            });
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

    const notify = (value: string) => {
        setMessage(value);
        window.setTimeout(() => setMessage(''), 2600);
    };

    const createSchedule = async (event: FormEvent) => {
        event.preventDefault();
        setBusy('create');
        setError('');

        try {
            await api('', {
                method: 'POST',
                body: JSON.stringify(form),
            });

            setForm(initialSchedule);
            setShowCreate(false);
            notify('Planification créée.');
            await load();
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Création impossible.',
            );
        } finally {
            setBusy(null);
        }
    };

    const toggleSchedule = async (schedule: Schedule) => {
        setBusy(`toggle-${schedule.id}`);
        setError('');

        try {
            await api(`/${schedule.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: schedule.name,
                    minute: schedule.cron.minute,
                    hour: schedule.cron.hour,
                    day_of_month: schedule.cron.day_of_month,
                    month: schedule.cron.month,
                    day_of_week: schedule.cron.day_of_week,
                    is_active: !schedule.is_active,
                    only_when_online: schedule.only_when_online,
                }),
            });

            notify(
                schedule.is_active
                    ? 'Planification désactivée.'
                    : 'Planification activée.',
            );
            await load();
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Modification impossible.',
            );
        } finally {
            setBusy(null);
        }
    };

    const execute = async (schedule: Schedule) => {
        if (!window.confirm(`Exécuter « ${schedule.name} » maintenant ?`)) {
            return;
        }

        setBusy(`execute-${schedule.id}`);
        setError('');

        try {
            await api(`/${schedule.id}/execute`, {
                method: 'POST',
                body: JSON.stringify({}),
            });

            notify('Exécution immédiate lancée.');
            await load();
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Exécution impossible.',
            );
        } finally {
            setBusy(null);
        }
    };

    const removeSchedule = async (schedule: Schedule) => {
        if (
            !window.confirm(
                `Supprimer définitivement « ${schedule.name} » ?`,
            )
        ) {
            return;
        }

        setBusy(`delete-${schedule.id}`);
        setError('');

        try {
            await api(`/${schedule.id}`, {
                method: 'DELETE',
            });

            notify('Planification supprimée.');
            await load();
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Suppression impossible.',
            );
        } finally {
            setBusy(null);
        }
    };

    const addTask = async (
        event: FormEvent,
        schedule: Schedule,
    ) => {
        event.preventDefault();

        const task = taskForms[schedule.id];

        if (!task) return;

        setBusy(`task-create-${schedule.id}`);
        setError('');

        try {
            await api(`/${schedule.id}/tasks`, {
                method: 'POST',
                body: JSON.stringify(task),
            });

            setTaskForms((current) => ({
                ...current,
                [schedule.id]: {
                    action: 'command',
                    payload: '',
                    time_offset: 0,
                    continue_on_failure: false,
                },
            }));

            notify('Action ajoutée.');
            await load();
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Ajout impossible.',
            );
        } finally {
            setBusy(null);
        }
    };

    const removeTask = async (
        schedule: Schedule,
        task: ScheduleTask,
    ) => {
        if (!window.confirm('Supprimer cette action ?')) return;

        setBusy(`task-delete-${task.id}`);
        setError('');

        try {
            await api(`/${schedule.id}/tasks/${task.id}`, {
                method: 'DELETE',
            });

            notify('Action supprimée.');
            await load();
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Suppression impossible.',
            );
        } finally {
            setBusy(null);
        }
    };

    return (
        <article className="min-w-0 rounded-3xl border border-white/10 bg-[#070d18] p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-violet-400">
                        Automatisation
                    </p>
                    <h2 className="mt-2 text-3xl font-black">
                        Tâches planifiées
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Automatise les sauvegardes, commandes et redémarrages.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => void load()}
                        className="rounded-xl border border-white/10 px-4 py-2 font-bold hover:bg-white/5"
                    >
                        ↻ Actualiser
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowCreate((value) => !value)}
                        className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2 font-black"
                    >
                        ＋ Nouvelle tâche
                    </button>
                </div>
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

            {showCreate && (
                <form
                    onSubmit={createSchedule}
                    className="mt-6 rounded-2xl border border-violet-400/20 bg-violet-400/[0.04] p-5"
                >
                    <h3 className="text-xl font-black">
                        Créer une planification
                    </h3>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <label>
                            <span className="text-sm text-slate-400">Nom</span>
                            <input
                                required
                                value={form.name}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        name: event.target.value,
                                    }))
                                }
                                placeholder="Sauvegarde quotidienne"
                                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400/50"
                            />
                        </label>

                        <div className="grid grid-cols-5 gap-2">
                            {[
                                ['minute', 'Min'],
                                ['hour', 'Heure'],
                                ['day_of_month', 'Jour'],
                                ['month', 'Mois'],
                                ['day_of_week', 'Semaine'],
                            ].map(([key, label]) => (
                                <label key={key}>
                                    <span className="text-xs text-slate-500">
                                        {label}
                                    </span>
                                    <input
                                        required
                                        value={
                                            form[
                                                key as keyof typeof form
                                            ] as string
                                        }
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                [key]: event.target.value,
                                            }))
                                        }
                                        className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-2 py-3 text-center font-mono outline-none focus:border-violet-400/50"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-5">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        is_active: event.target.checked,
                                    }))
                                }
                            />
                            Active
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.only_when_online}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        only_when_online:
                                            event.target.checked,
                                    }))
                                }
                            />
                            Uniquement si le serveur est en ligne
                        </label>
                    </div>

                    <p className="mt-4 text-xs text-slate-500">
                        Exemple quotidien à 04:00 : minute 0, heure 4,
                        puis * dans les trois autres champs.
                    </p>

                    <button
                        type="submit"
                        disabled={busy === 'create'}
                        className="mt-5 rounded-xl bg-violet-500 px-6 py-3 font-black disabled:opacity-40"
                    >
                        {busy === 'create'
                            ? 'Création...'
                            : 'Créer la planification'}
                    </button>
                </form>
            )}

            <div className="mt-6 space-y-4">
                {loading ? (
                    <div className="rounded-2xl border border-white/10 p-10 text-center text-slate-400">
                        Chargement...
                    </div>
                ) : schedules.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
                        <p className="text-lg font-black">
                            Aucune tâche planifiée
                        </p>
                        <p className="mt-2 text-sm text-slate-400">
                            Crée une automatisation puis ajoute-lui une ou plusieurs actions.
                        </p>
                    </div>
                ) : (
                    schedules.map((schedule) => {
                        const taskForm = taskForms[schedule.id];

                        return (
                            <div
                                key={schedule.id}
                                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                            >
                                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="text-xl font-black">
                                                {schedule.name}
                                            </h3>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-black ${
                                                    schedule.is_active
                                                        ? 'bg-emerald-400/10 text-emerald-300'
                                                        : 'bg-slate-400/10 text-slate-300'
                                                }`}
                                            >
                                                {schedule.is_active
                                                    ? 'Active'
                                                    : 'Désactivée'}
                                            </span>

                                            {schedule.is_processing && (
                                                <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-black text-amber-300">
                                                    En cours
                                                </span>
                                            )}
                                        </div>

                                        <code className="mt-3 block text-sm text-violet-300">
                                            {schedule.cron.minute}{' '}
                                            {schedule.cron.hour}{' '}
                                            {schedule.cron.day_of_month}{' '}
                                            {schedule.cron.month}{' '}
                                            {schedule.cron.day_of_week}
                                        </code>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                                                <p className="text-xs text-slate-500">
                                                    Prochaine exécution
                                                </p>
                                                <p className="mt-1 text-sm font-bold">
                                                    {formatDate(
                                                        schedule.next_run_at,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                                                <p className="text-xs text-slate-500">
                                                    Dernière exécution
                                                </p>
                                                <p className="mt-1 text-sm font-bold">
                                                    {formatDate(
                                                        schedule.last_run_at,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void toggleSchedule(schedule)
                                            }
                                            className="rounded-xl border border-white/10 px-4 py-2 font-bold hover:bg-white/5"
                                        >
                                            {schedule.is_active
                                                ? '⏸ Désactiver'
                                                : '▶ Activer'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                void execute(schedule)
                                            }
                                            className="rounded-xl border border-emerald-400/20 px-4 py-2 font-bold text-emerald-300 hover:bg-emerald-400/10"
                                        >
                                            ⚡ Exécuter
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenSchedule(
                                                    openSchedule === schedule.id
                                                        ? null
                                                        : schedule.id,
                                                )
                                            }
                                            className="rounded-xl border border-violet-400/20 px-4 py-2 font-bold text-violet-300 hover:bg-violet-400/10"
                                        >
                                            ⚙ Actions
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                void removeSchedule(schedule)
                                            }
                                            className="rounded-xl border border-red-400/20 px-4 py-2 font-bold text-red-300 hover:bg-red-400/10"
                                        >
                                            🗑 Supprimer
                                        </button>
                                    </div>
                                </div>

                                {openSchedule === schedule.id && (
                                    <div className="mt-5 border-t border-white/10 pt-5">
                                        <h4 className="font-black">
                                            Actions ordonnées
                                        </h4>

                                        <div className="mt-4 space-y-3">
                                            {schedule.tasks.length === 0 ? (
                                                <p className="text-sm text-slate-500">
                                                    Aucune action. Cette planification ne fera rien tant qu’une action n’est pas ajoutée.
                                                </p>
                                            ) : (
                                                schedule.tasks.map((task) => (
                                                    <div
                                                        key={task.id}
                                                        className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                                                    >
                                                        <div>
                                                            <p className="font-bold">
                                                                #{task.sequence_id}{' '}
                                                                {actionLabel(task)}
                                                            </p>
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                Délai : {task.time_offset}s · Continuer après erreur :{' '}
                                                                {task.continue_on_failure
                                                                    ? 'oui'
                                                                    : 'non'}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                void removeTask(
                                                                    schedule,
                                                                    task,
                                                                )
                                                            }
                                                            className="rounded-lg border border-red-400/20 px-3 py-2 text-sm font-bold text-red-300"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {taskForm && (
                                            <form
                                                onSubmit={(event) =>
                                                    void addTask(
                                                        event,
                                                        schedule,
                                                    )
                                                }
                                                className="mt-5 grid gap-3 lg:grid-cols-[180px_1fr_120px_auto_auto]"
                                            >
                                                <select
                                                    value={taskForm.action}
                                                    onChange={(event) =>
                                                        setTaskForms(
                                                            (current) => ({
                                                                ...current,
                                                                [schedule.id]: {
                                                                    ...current[
                                                                        schedule.id
                                                                    ],
                                                                    action: event
                                                                        .target
                                                                        .value as
                                                                        | 'command'
                                                                        | 'power'
                                                                        | 'backup',
                                                                    payload:
                                                                        event
                                                                            .target
                                                                            .value ===
                                                                        'backup'
                                                                            ? ''
                                                                            : current[
                                                                                  schedule
                                                                                      .id
                                                                              ]
                                                                                  .payload,
                                                                },
                                                            }),
                                                        )
                                                    }
                                                    className="rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3"
                                                >
                                                    <option value="command">
                                                        Commande
                                                    </option>
                                                    <option value="power">
                                                        Alimentation
                                                    </option>
                                                    <option value="backup">
                                                        Sauvegarde
                                                    </option>
                                                </select>

                                                {taskForm.action === 'power' ? (
                                                    <select
                                                        value={
                                                            taskForm.payload ||
                                                            'restart'
                                                        }
                                                        onChange={(event) =>
                                                            setTaskForms(
                                                                (current) => ({
                                                                    ...current,
                                                                    [schedule.id]: {
                                                                        ...current[
                                                                            schedule
                                                                                .id
                                                                        ],
                                                                        payload:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                    },
                                                                }),
                                                            )
                                                        }
                                                        className="rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3"
                                                    >
                                                        <option value="start">
                                                            Démarrer
                                                        </option>
                                                        <option value="stop">
                                                            Arrêter
                                                        </option>
                                                        <option value="restart">
                                                            Redémarrer
                                                        </option>
                                                        <option value="kill">
                                                            Forcer l’arrêt
                                                        </option>
                                                    </select>
                                                ) : (
                                                    <input
                                                        value={taskForm.payload}
                                                        disabled={
                                                            taskForm.action ===
                                                            'backup'
                                                        }
                                                        onChange={(event) =>
                                                            setTaskForms(
                                                                (current) => ({
                                                                    ...current,
                                                                    [schedule.id]: {
                                                                        ...current[
                                                                            schedule
                                                                                .id
                                                                        ],
                                                                        payload:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                    },
                                                                }),
                                                            )
                                                        }
                                                        placeholder={
                                                            taskForm.action ===
                                                            'backup'
                                                                ? 'Aucun paramètre'
                                                                : 'Ex. save-all'
                                                        }
                                                        className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 disabled:opacity-50"
                                                    />
                                                )}

                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={900}
                                                    value={
                                                        taskForm.time_offset
                                                    }
                                                    onChange={(event) =>
                                                        setTaskForms(
                                                            (current) => ({
                                                                ...current,
                                                                [schedule.id]: {
                                                                    ...current[
                                                                        schedule.id
                                                                    ],
                                                                    time_offset:
                                                                        Number(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                },
                                                            }),
                                                        )
                                                    }
                                                    title="Délai en secondes"
                                                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                                                />

                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            taskForm.continue_on_failure
                                                        }
                                                        onChange={(event) =>
                                                            setTaskForms(
                                                                (current) => ({
                                                                    ...current,
                                                                    [schedule.id]: {
                                                                        ...current[
                                                                            schedule
                                                                                .id
                                                                        ],
                                                                        continue_on_failure:
                                                                            event
                                                                                .target
                                                                                .checked,
                                                                    },
                                                                }),
                                                            )
                                                        }
                                                    />
                                                    Continuer si erreur
                                                </label>

                                                <button
                                                    type="submit"
                                                    className="rounded-xl bg-violet-500 px-5 py-3 font-black"
                                                >
                                                    Ajouter
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </article>
    );
}
