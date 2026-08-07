import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    BadgePercent,
    CalendarClock,
    CheckCircle2,
    Copy,
    Plus,
    Power,
    Trash2,
    Users,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import AdminShell from './admin-shell';

type Promo = {
    id: number;
    code: string;
    label: string | null;
    type: 'percent' | 'fixed';
    value: number;
    minimum_order_cents: number;
    maximum_discount_cents: number | null;
    usage_limit: number | null;
    used_count: number;
    one_per_user: boolean;
    is_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
    created_at: string | null;
};

type Props = {
    promos: Promo[];
};

type SharedProps = {
    flash?: {
        success?: string;
        error?: string;
    };
};

const euro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

export default function PromoIndex({ promos }: Props) {
    const flash = usePage<SharedProps>().props.flash;
    const [creating, setCreating] = useState(false);

    const form = useForm({
        code: '',
        label: '',
        type: 'percent' as 'percent' | 'fixed',
        value: 10,
        minimum_order_cents: 0,
        maximum_discount_cents: null as number | null,
        usage_limit: null as number | null,
        one_per_user: true,
        is_active: true,
        starts_at: '',
        ends_at: '',
    });

    const activeCount = useMemo(
        () => promos.filter((promo) => promo.is_active).length,
        [promos],
    );

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.post('/admin/promos', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setCreating(false);
            },
        });
    };

    const toggle = (promo: Promo) => {
        router.patch(
            `/admin/promos/${promo.id}`,
            {
                code: promo.code,
                label: promo.label ?? '',
                type: promo.type,
                value: promo.value,
                minimum_order_cents: promo.minimum_order_cents,
                maximum_discount_cents:
                    promo.maximum_discount_cents,
                usage_limit: promo.usage_limit,
                one_per_user: promo.one_per_user,
                is_active: !promo.is_active,
                starts_at: promo.starts_at,
                ends_at: promo.ends_at,
            },
            { preserveScroll: true },
        );
    };

    const destroy = (promo: Promo) => {
        if (
            !window.confirm(
                `Supprimer définitivement le code ${promo.code} ?`,
            )
        ) {
            return;
        }

        router.delete(`/admin/promos/${promo.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AdminShell>
            <Head title="Codes promo" />

            <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[.28em] text-violet-400">
                        Administration · Marketing
                    </p>

                    <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                        Codes promo
                    </h1>

                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                        Créez des réductions appliquées instantanément au moment du paiement.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setCreating((value) => !value)}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-black"
                >
                    <Plus className="h-4 w-4" />
                    Nouveau code
                </button>
            </section>

            {flash?.success && (
                <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                    {flash.success}
                </div>
            )}

            {flash?.error && (
                <div className="mt-5 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-200">
                    {flash.error}
                </div>
            )}

            <section className="mt-8 grid gap-4 sm:grid-cols-3">
                <Metric
                    label="Codes créés"
                    value={promos.length}
                    icon={BadgePercent}
                />
                <Metric
                    label="Codes actifs"
                    value={activeCount}
                    icon={CheckCircle2}
                />
                <Metric
                    label="Utilisations"
                    value={promos.reduce(
                        (total, promo) =>
                            total + promo.used_count,
                        0,
                    )}
                    icon={Users}
                />
            </section>

            {creating && (
                <form
                    onSubmit={submit}
                    className="mt-6 rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5 sm:p-6"
                >
                    <div className="flex items-center gap-3">
                        <BadgePercent className="h-5 w-5 text-violet-300" />
                        <h2 className="text-lg font-black">
                            Créer un code promo
                        </h2>
                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        <Field
                            label="Code"
                            value={form.data.code}
                            placeholder="ASTREON10"
                            error={form.errors.code}
                            onChange={(value) =>
                                form.setData(
                                    'code',
                                    value.toUpperCase(),
                                )
                            }
                        />

                        <Field
                            label="Nom interne"
                            value={form.data.label}
                            placeholder="Offre de lancement"
                            error={form.errors.label}
                            onChange={(value) =>
                                form.setData('label', value)
                            }
                        />

                        <Select
                            label="Type"
                            value={form.data.type}
                            onChange={(value) =>
                                form.setData(
                                    'type',
                                    value as 'percent' | 'fixed',
                                )
                            }
                            options={[
                                ['percent', 'Pourcentage'],
                                ['fixed', 'Montant fixe'],
                            ]}
                        />

                        <Field
                            label={
                                form.data.type === 'percent'
                                    ? 'Réduction (%)'
                                    : 'Réduction (centimes)'
                            }
                            type="number"
                            value={String(form.data.value)}
                            error={form.errors.value}
                            onChange={(value) =>
                                form.setData(
                                    'value',
                                    Number(value),
                                )
                            }
                        />

                        <Field
                            label="Commande minimum (centimes)"
                            type="number"
                            value={String(
                                form.data.minimum_order_cents,
                            )}
                            error={
                                form.errors.minimum_order_cents
                            }
                            onChange={(value) =>
                                form.setData(
                                    'minimum_order_cents',
                                    Number(value),
                                )
                            }
                        />

                        <Field
                            label="Réduction maximale (centimes)"
                            type="number"
                            value={
                                form.data.maximum_discount_cents
                                    ?.toString() ?? ''
                            }
                            placeholder="Facultatif"
                            error={
                                form.errors
                                    .maximum_discount_cents
                            }
                            onChange={(value) =>
                                form.setData(
                                    'maximum_discount_cents',
                                    value === ''
                                        ? null
                                        : Number(value),
                                )
                            }
                        />

                        <Field
                            label="Limite totale d’utilisation"
                            type="number"
                            value={
                                form.data.usage_limit
                                    ?.toString() ?? ''
                            }
                            placeholder="Illimitée"
                            error={form.errors.usage_limit}
                            onChange={(value) =>
                                form.setData(
                                    'usage_limit',
                                    value === ''
                                        ? null
                                        : Number(value),
                                )
                            }
                        />

                        <Field
                            label="Début"
                            type="datetime-local"
                            value={form.data.starts_at}
                            error={form.errors.starts_at}
                            onChange={(value) =>
                                form.setData('starts_at', value)
                            }
                        />

                        <Field
                            label="Fin"
                            type="datetime-local"
                            value={form.data.ends_at}
                            error={form.errors.ends_at}
                            onChange={(value) =>
                                form.setData('ends_at', value)
                            }
                        />
                    </div>

                    <div className="mt-6 flex flex-wrap gap-4">
                        <Toggle
                            checked={form.data.one_per_user}
                            label="Une utilisation par client"
                            onChange={(checked) =>
                                form.setData(
                                    'one_per_user',
                                    checked,
                                )
                            }
                        />

                        <Toggle
                            checked={form.data.is_active}
                            label="Code actif"
                            onChange={(checked) =>
                                form.setData(
                                    'is_active',
                                    checked,
                                )
                            }
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setCreating(false)}
                            className="rounded-xl border border-violet-400/20 px-5 py-3 text-sm font-black text-slate-300"
                        >
                            Annuler
                        </button>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white disabled:opacity-50"
                        >
                            {form.processing
                                ? 'Création...'
                                : 'Créer le code'}
                        </button>
                    </div>
                </form>
            )}

            <section className="mt-6 overflow-hidden rounded-2xl border border-violet-400/15 bg-[#110d20]/90">
                <div className="border-b border-violet-400/15 p-5">
                    <h2 className="font-black">
                        Codes disponibles
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-violet-400/10 bg-violet-500/5">
                            <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                                <th className="px-5 py-4">Code</th>
                                <th className="px-5 py-4">Réduction</th>
                                <th className="px-5 py-4">Utilisation</th>
                                <th className="px-5 py-4">Période</th>
                                <th className="px-5 py-4">Statut</th>
                                <th className="px-5 py-4 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-violet-400/10">
                            {promos.map((promo) => (
                                <tr key={promo.id}>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigator.clipboard
                                                        .writeText(
                                                            promo.code,
                                                        )
                                                }
                                                className="grid h-9 w-9 place-items-center rounded-lg border border-violet-400/15 bg-violet-500/10 text-violet-300"
                                                title="Copier"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>

                                            <div>
                                                <p className="font-black text-white">
                                                    {promo.code}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {promo.label
                                                        ?? 'Sans libellé'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 text-sm font-black text-emerald-300">
                                        {promo.type === 'percent'
                                            ? `${promo.value} %`
                                            : euro.format(
                                                promo.value / 100,
                                            )}
                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-300">
                                        {promo.used_count}
                                        {promo.usage_limit !== null
                                            ? ` / ${promo.usage_limit}`
                                            : ' / ∞'}
                                    </td>

                                    <td className="px-5 py-4 text-xs text-slate-400">
                                        <span className="inline-flex items-center gap-2">
                                            <CalendarClock className="h-4 w-4 text-violet-300" />
                                            {promo.ends_at
                                                ? new Date(
                                                    promo.ends_at,
                                                ).toLocaleDateString(
                                                    'fr-FR',
                                                )
                                                : 'Sans expiration'}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span className={`rounded-full px-3 py-1 text-xs font-black ${
                                            promo.is_active
                                                ? 'bg-emerald-500/10 text-emerald-300'
                                                : 'bg-slate-500/10 text-slate-400'
                                        }`}>
                                            {promo.is_active
                                                ? 'Actif'
                                                : 'Désactivé'}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => toggle(promo)}
                                                className="grid h-10 w-10 place-items-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-200"
                                                title={
                                                    promo.is_active
                                                        ? 'Désactiver'
                                                        : 'Activer'
                                                }
                                            >
                                                <Power className="h-4 w-4" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => destroy(promo)}
                                                className="grid h-10 w-10 place-items-center rounded-xl border border-rose-400/20 bg-rose-500/10 text-rose-300"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {promos.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-16 text-center text-sm text-slate-500"
                                    >
                                        Aucun code promo créé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </AdminShell>
    );
}

function Metric({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number;
    icon: typeof BadgePercent;
}) {
    return (
        <article className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-400">
                        {label}
                    </p>
                    <p className="mt-2 text-3xl font-black">
                        {value}
                    </p>
                </div>

                <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/10 text-violet-300">
                    <Icon className="h-5 w-5" />
                </span>
            </div>
        </article>
    );
}

function Field({
    label,
    value,
    placeholder,
    type = 'text',
    error,
    onChange,
}: {
    label: string;
    value: string;
    placeholder?: string;
    type?: string;
    error?: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                {label}
            </span>

            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="mt-2 h-12 w-full rounded-xl border border-violet-400/15 bg-[#090714] px-4 text-sm text-white outline-none transition focus:border-violet-400"
            />

            {error && (
                <span className="mt-2 block text-xs font-bold text-rose-300">
                    {error}
                </span>
            )}
        </label>
    );
}

function Select({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: Array<[string, string]>;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                {label}
            </span>

            <select
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="mt-2 h-12 w-full rounded-xl border border-violet-400/15 bg-[#090714] px-4 text-sm text-white outline-none transition focus:border-violet-400"
            >
                {options.map(([optionValue, optionLabel]) => (
                    <option
                        key={optionValue}
                        value={optionValue}
                    >
                        {optionLabel}
                    </option>
                ))}
            </select>
        </label>
    );
}

function Toggle({
    checked,
    label,
    onChange,
}: {
    checked: boolean;
    label: string;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-violet-400/15 bg-[#090714] px-4 py-3">
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) =>
                    onChange(event.target.checked)
                }
                className="h-4 w-4 accent-violet-600"
            />
            <span className="text-sm font-bold text-slate-300">
                {label}
            </span>
        </label>
    );
}
