import { Head, useForm, usePage } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { FormEvent } from 'react';
import AccountLayout from '../components/account-layout';
import { Card, Field, inputClass } from '../components/ui';

type Profile = {
    first_name?: string | null;
    last_name?: string | null;
    company_name?: string | null;
    email?: string | null;
    address_line_1?: string | null;
    address_line_2?: string | null;
    // Compatibilité avec les noms utilisés par le formulaire d'inscription.
    address?: string | null;
    address_complement?: string | null;
    city?: string | null;
    region?: string | null;
    postal_code?: string | null;
    country?: string | null;
    phone?: string | null;
    locale?: 'fr' | 'en' | null;
    marketing_emails?: boolean | null;
    billing_emails?: boolean | null;
    support_emails?: boolean | null;
};

type Props = {
    profile: Profile;
};

type SharedProps = {
    flash?: {
        success?: string;
    };
};

export default function ProfileIndex({ profile }: Props) {
    const flash = usePage<SharedProps>().props.flash;

    const form = useForm({
        first_name: profile.first_name ?? '',
        last_name: profile.last_name ?? '',
        company_name: profile.company_name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        address_line_1:
            profile.address_line_1 ?? profile.address ?? '',
        address_line_2:
            profile.address_line_2 ?? profile.address_complement ?? '',
        postal_code: profile.postal_code ?? '',
        city: profile.city ?? '',
        region: profile.region ?? '',
        country: profile.country ?? 'France',
        locale: profile.locale ?? 'fr',
        marketing_emails: Boolean(profile.marketing_emails),
        billing_emails: Boolean(profile.billing_emails),
        support_emails: Boolean(profile.support_emails),
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.patch('/client/account', {
            preserveScroll: true,
        });
    }

    return (
        <AccountLayout section="account">
            <Head title="Mes informations" />

            {flash?.success && (
                <div
                    role="status"
                    className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200"
                >
                    {flash.success}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <Card
                    title="Mes informations"
                    description="Retrouvez et modifiez les informations renseignées lors de votre inscription."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Prénom">
                            <input
                                name="first_name"
                                autoComplete="given-name"
                                className={inputClass}
                                value={form.data.first_name}
                                onChange={(event) =>
                                    form.setData(
                                        'first_name',
                                        event.target.value,
                                    )
                                }
                            />
                            <FormError message={form.errors.first_name} />
                        </Field>

                        <Field label="Nom">
                            <input
                                name="last_name"
                                autoComplete="family-name"
                                className={inputClass}
                                value={form.data.last_name}
                                onChange={(event) =>
                                    form.setData(
                                        'last_name',
                                        event.target.value,
                                    )
                                }
                            />
                            <FormError message={form.errors.last_name} />
                        </Field>

                        <Field label="Adresse e-mail">
                            <input
                                name="email"
                                type="email"
                                autoComplete="email"
                                className={inputClass}
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }
                            />
                            <FormError message={form.errors.email} />
                        </Field>

                        <Field label="Numéro de téléphone">
                            <input
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                className={inputClass}
                                value={form.data.phone}
                                onChange={(event) =>
                                    form.setData('phone', event.target.value)
                                }
                            />
                            <FormError message={form.errors.phone} />
                        </Field>

                        <Field label="Nom de l’entreprise (facultatif)">
                            <input
                                name="company_name"
                                autoComplete="organization"
                                className={inputClass}
                                value={form.data.company_name}
                                onChange={(event) =>
                                    form.setData(
                                        'company_name',
                                        event.target.value,
                                    )
                                }
                            />
                            <FormError message={form.errors.company_name} />
                        </Field>

                        <Field label="Langue">
                            <select
                                name="locale"
                                className={inputClass}
                                value={form.data.locale}
                                onChange={(event) =>
                                    form.setData(
                                        'locale',
                                        event.target.value as 'fr' | 'en',
                                    )
                                }
                            >
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                            </select>
                            <FormError message={form.errors.locale} />
                        </Field>

                        <div className="md:col-span-2">
                            <Field label="Adresse">
                                <input
                                    name="address_line_1"
                                    autoComplete="address-line1"
                                    className={inputClass}
                                    value={form.data.address_line_1}
                                    onChange={(event) =>
                                        form.setData(
                                            'address_line_1',
                                            event.target.value,
                                        )
                                    }
                                />
                                <FormError
                                    message={form.errors.address_line_1}
                                />
                            </Field>
                        </div>

                        <div className="md:col-span-2">
                            <Field label="Complément d’adresse (facultatif)">
                                <input
                                    name="address_line_2"
                                    autoComplete="address-line2"
                                    className={inputClass}
                                    value={form.data.address_line_2}
                                    onChange={(event) =>
                                        form.setData(
                                            'address_line_2',
                                            event.target.value,
                                        )
                                    }
                                />
                                <FormError
                                    message={form.errors.address_line_2}
                                />
                            </Field>
                        </div>

                        <Field label="Code postal">
                            <input
                                name="postal_code"
                                autoComplete="postal-code"
                                className={inputClass}
                                value={form.data.postal_code}
                                onChange={(event) =>
                                    form.setData(
                                        'postal_code',
                                        event.target.value,
                                    )
                                }
                            />
                            <FormError message={form.errors.postal_code} />
                        </Field>

                        <Field label="Ville">
                            <input
                                name="city"
                                autoComplete="address-level2"
                                className={inputClass}
                                value={form.data.city}
                                onChange={(event) =>
                                    form.setData('city', event.target.value)
                                }
                            />
                            <FormError message={form.errors.city} />
                        </Field>

                        <Field label="Région (facultatif)">
                            <input
                                name="region"
                                autoComplete="address-level1"
                                className={inputClass}
                                value={form.data.region}
                                onChange={(event) =>
                                    form.setData('region', event.target.value)
                                }
                            />
                            <FormError message={form.errors.region} />
                        </Field>

                        <Field label="Pays">
                            <input
                                name="country"
                                autoComplete="country-name"
                                className={inputClass}
                                value={form.data.country}
                                onChange={(event) =>
                                    form.setData('country', event.target.value)
                                }
                            />
                            <FormError message={form.errors.country} />
                        </Field>
                    </div>
                </Card>

                <Card
                    title="Préférences courriel"
                    description="Choisissez les messages que vous souhaitez recevoir."
                >
                    <div className="space-y-3">
                        <Toggle
                            label="Courriels généraux : annonces et informations liées au compte"
                            checked={form.data.marketing_emails}
                            onChange={(value) =>
                                form.setData('marketing_emails', value)
                            }
                        />

                        <Toggle
                            label="Courriels de facturation : factures, rappels et paiements"
                            checked={form.data.billing_emails}
                            onChange={(value) =>
                                form.setData('billing_emails', value)
                            }
                        />

                        <Toggle
                            label="Courriels du support : réponses et changements de statut des tickets"
                            checked={form.data.support_emails}
                            onChange={(value) =>
                                form.setData('support_emails', value)
                            }
                        />
                    </div>
                </Card>

                <button
                    type="submit"
                    disabled={form.processing}
                    className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    {form.processing
                        ? 'Enregistrement…'
                        : 'Sauvegarder les modifications'}
                </button>
            </form>
        </AccountLayout>
    );
}

function FormError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="mt-1 text-sm text-red-400">{message}</p>;
}

function Toggle({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/5 bg-black/10 p-4">
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="h-5 w-5 accent-violet-500"
            />
            <span className="text-sm font-bold text-slate-300">{label}</span>
        </label>
    );
}