import { Head, useForm, usePage } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { FormEvent } from 'react';
import AccountLayout from '../components/account-layout';
import { Card, Field, inputClass } from '../components/ui';

type Profile = {
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
    email: string;
    address_line_1: string | null;
    address_line_2: string | null;
    city: string | null;
    region: string | null;
    postal_code: string | null;
    country: string | null;
    phone: string | null;
    locale: 'fr' | 'en' | null;
    marketing_emails: boolean;
    billing_emails: boolean;
    support_emails: boolean;
};

type Props = { profile: Profile };
type SharedProps = { flash?: { success?: string } };

export default function ProfileIndex({ profile }: Props) {
    const flash = usePage<SharedProps>().props.flash;

    const form = useForm({
        first_name: profile.first_name ?? '',
        last_name: profile.last_name ?? '',
        company_name: profile.company_name ?? '',
        email: profile.email,
        address_line_1: profile.address_line_1 ?? '',
        address_line_2: profile.address_line_2 ?? '',
        city: profile.city ?? '',
        region: profile.region ?? '',
        postal_code: profile.postal_code ?? '',
        country: profile.country ?? 'France',
        phone: profile.phone ?? '',
        locale: profile.locale ?? 'fr',
        marketing_emails: Boolean(profile.marketing_emails),
        billing_emails: Boolean(profile.billing_emails),
        support_emails: Boolean(profile.support_emails),
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.patch('/client/account', { preserveScroll: true });
    }

    return (
        <AccountLayout section="account">
            <Head title="Mes informations" />

            {flash?.success && (
                <div className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                    {flash.success}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <Card
                    title="Mes informations"
                    description="Renseignez vos coordonnées personnelles et de facturation."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Prénom">
                            <input className={inputClass} value={form.data.first_name} onChange={(e) => form.setData('first_name', e.target.value)} />
                        </Field>
                        <Field label="Adresse 1">
                            <input className={inputClass} value={form.data.address_line_1} onChange={(e) => form.setData('address_line_1', e.target.value)} />
                        </Field>
                        <Field label="Nom">
                            <input className={inputClass} value={form.data.last_name} onChange={(e) => form.setData('last_name', e.target.value)} />
                        </Field>
                        <Field label="Adresse 2">
                            <input className={inputClass} value={form.data.address_line_2} onChange={(e) => form.setData('address_line_2', e.target.value)} />
                        </Field>
                        <Field label="Nom d’entreprise">
                            <input className={inputClass} value={form.data.company_name} onChange={(e) => form.setData('company_name', e.target.value)} />
                        </Field>
                        <Field label="Ville">
                            <input className={inputClass} value={form.data.city} onChange={(e) => form.setData('city', e.target.value)} />
                        </Field>
                        <Field label="Adresse courriel">
                            <input type="email" className={inputClass} value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                        </Field>
                        <Field label="État / Région">
                            <input className={inputClass} value={form.data.region} onChange={(e) => form.setData('region', e.target.value)} />
                        </Field>
                        <Field label="Langue">
                            <select className={inputClass} value={form.data.locale} onChange={(e) => form.setData('locale', e.target.value as 'fr' | 'en')}>
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                            </select>
                        </Field>
                        <Field label="Code postal">
                            <input className={inputClass} value={form.data.postal_code} onChange={(e) => form.setData('postal_code', e.target.value)} />
                        </Field>
                        <Field label="Numéro de téléphone">
                            <input className={inputClass} value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                        </Field>
                        <Field label="Pays">
                            <input className={inputClass} value={form.data.country} onChange={(e) => form.setData('country', e.target.value)} />
                        </Field>
                    </div>
                </Card>

                <Card title="Préférences courriel">
                    <div className="space-y-3">
                        <Toggle label="Courriels généraux : annonces et informations liées au compte" checked={form.data.marketing_emails} onChange={(value) => form.setData('marketing_emails', value)} />
                        <Toggle label="Courriels de facturation : factures, rappels et paiements" checked={form.data.billing_emails} onChange={(value) => form.setData('billing_emails', value)} />
                        <Toggle label="Courriels du support : réponses et changements de statut des tickets" checked={form.data.support_emails} onChange={(value) => form.setData('support_emails', value)} />
                    </div>
                </Card>

                <button
                    type="submit"
                    disabled={form.processing}
                    className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 text-sm font-black disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    Sauvegarder les modifications
                </button>
            </form>
        </AccountLayout>
    );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
    return (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/5 bg-black/10 p-4">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-violet-500" />
            <span className="text-sm font-bold text-slate-300">{label}</span>
        </label>
    );
}
