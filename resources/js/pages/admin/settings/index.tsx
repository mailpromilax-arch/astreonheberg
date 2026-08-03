import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    CircleDollarSign,
    Cog,
    LifeBuoy,
    LockKeyhole,
    Save,
    ServerCog,
} from 'lucide-react';
import { FormEvent } from 'react';
import AdminShell from './admin-shell';

type Settings = {
    general: {
        site_name: string;
        site_url: string;
        support_email: string;
        default_locale: 'fr' | 'en';
        timezone: string;
    };
    access: {
        registrations_enabled: boolean;
        maintenance_enabled: boolean;
        email_verification_required: boolean;
    };
    billing: {
        company_name: string;
        company_address: string;
        company_vat: string;
        currency: 'EUR' | 'USD' | 'GBP' | 'CHF';
        invoice_prefix: string;
        tax_rate: number;
    };
    support: {
        ticket_auto_close_days: number;
        max_attachments: number;
        max_attachment_size_mb: number;
    };
};

type Props = {
    settings: Settings;
    environment: {
        app_env: string;
        debug: boolean;
        php_version: string;
        laravel_version: string;
        queue_connection: string;
        cache_store: string;
        mail_mailer: string;
        pterodactyl_configured: boolean;
    };
};

type SharedProps = {
    flash?: {
        success?: string;
    };
};

export default function AdminSettingsIndex({
    settings,
    environment,
}: Props) {
    const flash = usePage<SharedProps>().props.flash;
    const form = useForm<Settings>(settings);

    function submit(event: FormEvent) {
        event.preventDefault();
        form.patch('/admin/settings', {
            preserveScroll: true,
        });
    }

    return (
        <AdminShell>
            <Head title="Paramètres" />

            <section>
                <p className="text-xs font-black uppercase tracking-[.28em] text-violet-400">
                    Administration · Paramètres
                </p>
                <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                    Configuration de la plateforme
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                    Gérez les informations générales, l’accès, la facturation et
                    les règles du support client.
                </p>
            </section>

            {flash?.success && (
                <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                    {flash.success}
                </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-6">
                <SettingsSection
                    icon={Cog}
                    title="Informations générales"
                    description="Identité et configuration principale du site."
                >
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Field label="Nom du site">
                            <input
                                value={form.data.general.site_name}
                                onChange={(event) =>
                                    form.setData('general', {
                                        ...form.data.general,
                                        site_name: event.target.value,
                                    })
                                }
                                className="input"
                            />
                        </Field>

                        <Field label="Adresse du site">
                            <input
                                type="url"
                                value={form.data.general.site_url}
                                onChange={(event) =>
                                    form.setData('general', {
                                        ...form.data.general,
                                        site_url: event.target.value,
                                    })
                                }
                                className="input"
                            />
                        </Field>

                        <Field label="E-mail du support">
                            <input
                                type="email"
                                value={form.data.general.support_email}
                                onChange={(event) =>
                                    form.setData('general', {
                                        ...form.data.general,
                                        support_email: event.target.value,
                                    })
                                }
                                className="input"
                            />
                        </Field>

                        <Field label="Langue par défaut">
                            <select
                                value={form.data.general.default_locale}
                                onChange={(event) =>
                                    form.setData('general', {
                                        ...form.data.general,
                                        default_locale: event.target.value as 'fr' | 'en',
                                    })
                                }
                                className="input"
                            >
                                <option value="fr">Français</option>
                                <option value="en">Anglais</option>
                            </select>
                        </Field>

                        <Field label="Fuseau horaire">
                            <input
                                value={form.data.general.timezone}
                                onChange={(event) =>
                                    form.setData('general', {
                                        ...form.data.general,
                                        timezone: event.target.value,
                                    })
                                }
                                placeholder="Europe/Paris"
                                className="input"
                            />
                        </Field>
                    </div>
                </SettingsSection>

                <SettingsSection
                    icon={LockKeyhole}
                    title="Accès et sécurité"
                    description="Contrôlez les inscriptions et les protections du site."
                >
                    <div className="grid gap-4 lg:grid-cols-3">
                        <Toggle
                            label="Inscriptions ouvertes"
                            checked={form.data.access.registrations_enabled}
                            onChange={(checked) =>
                                form.setData('access', {
                                    ...form.data.access,
                                    registrations_enabled: checked,
                                })
                            }
                        />
                        <Toggle
                            label="Mode maintenance"
                            checked={form.data.access.maintenance_enabled}
                            onChange={(checked) =>
                                form.setData('access', {
                                    ...form.data.access,
                                    maintenance_enabled: checked,
                                })
                            }
                        />
                        <Toggle
                            label="Vérification e-mail obligatoire"
                            checked={form.data.access.email_verification_required}
                            onChange={(checked) =>
                                form.setData('access', {
                                    ...form.data.access,
                                    email_verification_required: checked,
                                })
                            }
                        />
                    </div>
                </SettingsSection>

                <SettingsSection
                    icon={CircleDollarSign}
                    title="Facturation"
                    description="Informations utilisées pour les factures et commandes."
                >
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Field label="Raison sociale">
                            <input
                                value={form.data.billing.company_name}
                                onChange={(event) =>
                                    form.setData('billing', {
                                        ...form.data.billing,
                                        company_name: event.target.value,
                                    })
                                }
                                className="input"
                            />
                        </Field>

                        <Field label="Numéro de TVA">
                            <input
                                value={form.data.billing.company_vat}
                                onChange={(event) =>
                                    form.setData('billing', {
                                        ...form.data.billing,
                                        company_vat: event.target.value,
                                    })
                                }
                                className="input"
                            />
                        </Field>

                        <Field label="Adresse de facturation">
                            <textarea
                                rows={4}
                                value={form.data.billing.company_address}
                                onChange={(event) =>
                                    form.setData('billing', {
                                        ...form.data.billing,
                                        company_address: event.target.value,
                                    })
                                }
                                className="input h-auto py-3"
                            />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <Field label="Devise">
                                <select
                                    value={form.data.billing.currency}
                                    onChange={(event) =>
                                        form.setData('billing', {
                                            ...form.data.billing,
                                            currency: event.target.value as Settings['billing']['currency'],
                                        })
                                    }
                                    className="input"
                                >
                                    <option value="EUR">EUR</option>
                                    <option value="USD">USD</option>
                                    <option value="GBP">GBP</option>
                                    <option value="CHF">CHF</option>
                                </select>
                            </Field>

                            <Field label="Préfixe facture">
                                <input
                                    value={form.data.billing.invoice_prefix}
                                    onChange={(event) =>
                                        form.setData('billing', {
                                            ...form.data.billing,
                                            invoice_prefix: event.target.value.toUpperCase(),
                                        })
                                    }
                                    className="input"
                                />
                            </Field>

                            <Field label="TVA (%)">
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step="0.01"
                                    value={form.data.billing.tax_rate}
                                    onChange={(event) =>
                                        form.setData('billing', {
                                            ...form.data.billing,
                                            tax_rate: Number(event.target.value),
                                        })
                                    }
                                    className="input"
                                />
                            </Field>
                        </div>
                    </div>
                </SettingsSection>

                <SettingsSection
                    icon={LifeBuoy}
                    title="Support"
                    description="Limites et fonctionnement des tickets."
                >
                    <div className="grid gap-4 lg:grid-cols-3">
                        <Field label="Fermeture automatique (jours)">
                            <input
                                type="number"
                                min={0}
                                value={form.data.support.ticket_auto_close_days}
                                onChange={(event) =>
                                    form.setData('support', {
                                        ...form.data.support,
                                        ticket_auto_close_days: Number(event.target.value),
                                    })
                                }
                                className="input"
                            />
                        </Field>

                        <Field label="Pièces jointes maximales">
                            <input
                                type="number"
                                min={0}
                                max={20}
                                value={form.data.support.max_attachments}
                                onChange={(event) =>
                                    form.setData('support', {
                                        ...form.data.support,
                                        max_attachments: Number(event.target.value),
                                    })
                                }
                                className="input"
                            />
                        </Field>

                        <Field label="Taille maximale par fichier (Mo)">
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={form.data.support.max_attachment_size_mb}
                                onChange={(event) =>
                                    form.setData('support', {
                                        ...form.data.support,
                                        max_attachment_size_mb: Number(event.target.value),
                                    })
                                }
                                className="input"
                            />
                        </Field>
                    </div>
                </SettingsSection>

                <SettingsSection
                    icon={ServerCog}
                    title="État technique"
                    description="Informations en lecture seule provenant de l’environnement."
                >
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <Status label="Environnement" value={environment.app_env} />
                        <Status label="Laravel" value={environment.laravel_version} />
                        <Status label="PHP" value={environment.php_version} />
                        <Status label="Queue" value={environment.queue_connection} />
                        <Status label="Cache" value={environment.cache_store} />
                        <Status label="Mail" value={environment.mail_mailer} />
                        <Status
                            label="Mode debug"
                            value={environment.debug ? 'Activé' : 'Désactivé'}
                            ok={!environment.debug}
                        />
                        <Status
                            label="Pterodactyl"
                            value={environment.pterodactyl_configured ? 'Configuré' : 'Non configuré'}
                            ok={environment.pterodactyl_configured}
                        />
                    </div>
                </SettingsSection>

                {Object.keys(form.errors).length > 0 && (
                    <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                        Vérifiez les champs signalés avant d’enregistrer.
                    </div>
                )}

                <div className="sticky bottom-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 text-sm font-black shadow-2xl disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {form.processing ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </form>
        </AdminShell>
    );
}

function SettingsSection({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: typeof Cog;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90">
            <div className="flex items-center gap-3 border-b border-violet-400/15 p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-300">
                    <Icon className="h-5 w-5" />
                </span>
                <div>
                    <h2 className="font-black">{title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{description}</p>
                </div>
            </div>
            <div className="p-5">{children}</div>
        </section>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label>
            <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                {label}
            </span>
            {children}
        </label>
    );
}

function Toggle({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-black/10 p-4">
            <span className="text-sm font-black">{label}</span>
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="h-5 w-5 accent-violet-500"
            />
        </label>
    );
}

function Status({
    label,
    value,
    ok = true,
}: {
    label: string;
    value: string;
    ok?: boolean;
}) {
    return (
        <article className="rounded-xl border border-white/5 bg-black/10 p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-black uppercase tracking-wider text-slate-600">
                        {label}
                    </p>
                    <p className="mt-2 text-sm font-black">{value}</p>
                </div>
                <CheckCircle2 className={`h-5 w-5 ${ok ? 'text-emerald-300' : 'text-amber-300'}`} />
            </div>
        </article>
    );
}
