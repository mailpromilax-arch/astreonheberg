import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

type StartupVariable = {
    name: string;
    description: string;
    env_variable: string;
    default_value: string;
    server_value: string;
    is_editable: boolean;
    rules: string;
};

type Props = {
    serviceId: number;
};

const csrf = () =>
    document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.getAttribute('content') ?? '';

const enumValues = (variable: StartupVariable): string[] => {
    const rule = variable.rules
        .split('|')
        .find((item) => item.startsWith('in:'));

    return rule
        ? rule.slice(3).split(',').map((value) => value.trim())
        : [];
};

const isBooleanVariable = (variable: StartupVariable): boolean => {
    const values = enumValues(variable);

    return (
        variable.rules.split('|').includes('boolean') ||
        (values.length === 2 &&
            ((values.includes('0') && values.includes('1')) ||
                (values.includes('true') && values.includes('false'))))
    );
};

const isNumericVariable = (variable: StartupVariable): boolean =>
    variable.rules
        .split('|')
        .some((rule) => rule === 'integer' || rule === 'numeric');

export default function ServerStartup({ serviceId }: Props) {
    const [variables, setVariables] = useState<StartupVariable[]>([]);
    const [values, setValues] = useState<Record<string, string>>({});
    const [startupCommand, setStartupCommand] = useState('');
    const [rawStartupCommand, setRawStartupCommand] = useState('');
    const [dockerImage, setDockerImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [restarting, setRestarting] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const api = useCallback(
        async (
            path: string,
            options: RequestInit = {},
        ): Promise<any> => {
            const response = await fetch(
                `/client/services/${serviceId}/startup${path}`,
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

    const loadStartup = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const payload = await api('');
            const receivedVariables =
                (payload.variables ?? []) as StartupVariable[];

            setVariables(receivedVariables);
            setValues(
                Object.fromEntries(
                    receivedVariables.map((variable) => [
                        variable.env_variable,
                        variable.server_value ??
                            variable.default_value ??
                            '',
                    ]),
                ),
            );
            setStartupCommand(payload.startup_command ?? '');
            setRawStartupCommand(payload.raw_startup_command ?? '');
            setDockerImage(payload.docker_image ?? '');
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
        void loadStartup();
    }, [loadStartup]);

    const editableVariables = useMemo(
        () => variables.filter((variable) => variable.is_editable),
        [variables],
    );

    const save = async (
        event: FormEvent,
        restart: boolean,
    ) => {
        event.preventDefault();

        restart ? setRestarting(true) : setSaving(true);
        setError('');
        setMessage('');

        try {
            const payload = await api('', {
                method: 'PUT',
                body: JSON.stringify({
                    variables: values,
                    restart,
                }),
            });

            setMessage(
                payload.message ??
                    (restart
                        ? 'Variables enregistrées et redémarrage lancé.'
                        : 'Variables enregistrées.'),
            );

            await loadStartup();
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Enregistrement impossible.',
            );
        } finally {
            setSaving(false);
            setRestarting(false);
        }
    };

    return (
        <article className="rounded-3xl border border-white/10 bg-[#070d18] p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-400">
                        Configuration
                    </p>

                    <h2 className="mt-2 text-3xl font-black">
                        Variables de démarrage
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        Modifie les paramètres exposés par l’Egg Pterodactyl.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void loadStartup()}
                    disabled={loading}
                    className="rounded-xl border border-white/10 px-4 py-2 font-bold hover:bg-white/5 disabled:opacity-50"
                >
                    ↻ Actualiser
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

            {loading ? (
                <div className="mt-6 rounded-2xl border border-white/10 p-10 text-center text-slate-400">
                    Chargement...
                </div>
            ) : (
                <>
                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                            <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                                Image Docker
                            </p>

                            <code className="mt-3 block break-all text-sm text-cyan-300">
                                {dockerImage || '—'}
                            </code>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                            <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                                Commande de démarrage
                            </p>

                            <code className="mt-3 block max-h-32 overflow-auto whitespace-pre-wrap break-all text-sm text-emerald-300">
                                {startupCommand || rawStartupCommand || '—'}
                            </code>
                        </div>
                    </div>

                    <form
                        onSubmit={(event) => void save(event, false)}
                        className="mt-6"
                    >
                        {editableVariables.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
                                <p className="text-lg font-black">
                                    Aucune variable modifiable
                                </p>

                                <p className="mt-2 text-sm text-slate-400">
                                    Cet Egg n’expose aucune variable au client.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 lg:grid-cols-2">
                                {editableVariables.map((variable) => {
                                    const choices =
                                        enumValues(variable);
                                    const boolean =
                                        isBooleanVariable(variable);
                                    const numeric =
                                        isNumericVariable(variable);

                                    return (
                                        <label
                                            key={variable.env_variable}
                                            className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <span className="block font-black">
                                                        {variable.name}
                                                    </span>

                                                    <code className="mt-1 block break-all text-xs text-amber-300">
                                                        {variable.env_variable}
                                                    </code>
                                                </div>

                                                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
                                                    {boolean
                                                        ? 'Oui / Non'
                                                        : numeric
                                                          ? 'Nombre'
                                                          : 'Texte'}
                                                </span>
                                            </div>

                                            {variable.description && (
                                                <span className="mt-3 block text-sm leading-6 text-slate-400">
                                                    {variable.description}
                                                </span>
                                            )}

                                            {choices.length > 0 ? (
                                                <select
                                                    value={
                                                        values[
                                                            variable
                                                                .env_variable
                                                        ] ??
                                                        variable.default_value ??
                                                        choices[0]
                                                    }
                                                    onChange={(event) =>
                                                        setValues(
                                                            (current) => ({
                                                                ...current,
                                                                [variable.env_variable]:
                                                                    event.target.value,
                                                            }),
                                                        )
                                                    }
                                                    className="mt-4 w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 outline-none focus:border-amber-400/50"
                                                >
                                                    {choices.map((choice) => (
                                                        <option
                                                            key={choice}
                                                            value={choice}
                                                        >
                                                            {boolean
                                                                ? choice === '1' ||
                                                                  choice === 'true'
                                                                    ? 'Activé'
                                                                    : 'Désactivé'
                                                                : choice}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type={
                                                        numeric
                                                            ? 'number'
                                                            : 'text'
                                                    }
                                                    value={
                                                        values[
                                                            variable
                                                                .env_variable
                                                        ] ?? ''
                                                    }
                                                    onChange={(event) =>
                                                        setValues(
                                                            (current) => ({
                                                                ...current,
                                                                [variable.env_variable]:
                                                                    event
                                                                        .target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    className="mt-4 w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 outline-none focus:border-amber-400/50"
                                                />
                                            )}

                                            <span className="mt-3 block text-xs text-slate-500">
                                                Valeur par défaut :{' '}
                                                {variable.default_value ||
                                                    'vide'}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-6">
                            <button
                                type="submit"
                                disabled={saving || restarting}
                                className="rounded-xl bg-emerald-500 px-6 py-3 font-black disabled:opacity-40"
                            >
                                {saving
                                    ? 'Enregistrement...'
                                    : '💾 Enregistrer'}
                            </button>

                            <button
                                type="button"
                                onClick={(event) =>
                                    void save(event, true)
                                }
                                disabled={saving || restarting}
                                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-black disabled:opacity-40"
                            >
                                {restarting
                                    ? 'Redémarrage...'
                                    : '↻ Enregistrer et redémarrer'}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </article>
    );
}