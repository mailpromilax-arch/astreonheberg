import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Save, Trash2 } from 'lucide-react';
import { FormEvent } from 'react';
import AccountLayout from '../components/account-layout';
import { Card, Field, inputClass } from '../components/ui';

type Contact = {
    id: number;
    first_name: string;
    last_name: string;
    company_name?: string | null;
    email: string;
    phone?: string | null;
    address_line_1?: string | null;
    address_line_2?: string | null;
    city?: string | null;
    region?: string | null;
    postal_code?: string | null;
    country?: string | null;
    general_emails: boolean;
    billing_emails: boolean;
    support_emails: boolean;
    is_default_billing: boolean;
};

type Props = { contacts: Contact[] };
type SharedProps = { flash?: { success?: string } };

export default function ContactsIndex({ contacts }: Props) {
    const flash = usePage<SharedProps>().props.flash;
    const form = useForm({
        first_name: '',
        last_name: '',
        company_name: '',
        email: '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        region: '',
        postal_code: '',
        country: 'France',
        general_emails: false,
        billing_emails: false,
        support_emails: false,
        is_default_billing: false,
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.post('/client/account/contacts', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <AccountLayout section="account">
            <Head title="Gestion des contacts" />

            {flash?.success && (
                <div className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                    {flash.success}
                </div>
            )}

            <div className="space-y-6">
                {contacts.length > 0 && (
                    <Card title="Contacts existants">
                        <div className="space-y-3">
                            {contacts.map((contact) => (
                                <div key={contact.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/10 p-4">
                                    <div>
                                        <p className="text-sm font-black">
                                            {contact.first_name} {contact.last_name}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {contact.email} · {contact.company_name ?? 'Particulier'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => router.delete(`/client/account/contacts/${contact.id}`, { preserveScroll: true })}
                                        className="grid h-9 w-9 place-items-center rounded-lg bg-rose-500/10 text-rose-300"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                <Card title="Ajouter un contact">
                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            {[
                                ['first_name', 'Prénom'],
                                ['address_line_1', 'Adresse 1'],
                                ['last_name', 'Nom'],
                                ['address_line_2', 'Adresse 2'],
                                ['company_name', 'Nom d’entreprise'],
                                ['city', 'Ville'],
                                ['email', 'Adresse courriel'],
                                ['region', 'État / Région'],
                                ['phone', 'Numéro de téléphone'],
                                ['postal_code', 'Code postal'],
                                ['country', 'Pays'],
                            ].map(([key, label]) => (
                                <Field key={key} label={label}>
                                    <input
                                        type={key === 'email' ? 'email' : 'text'}
                                        className={inputClass}
                                        value={String(form.data[key as keyof typeof form.data] ?? '')}
                                        onChange={(e) => form.setData(key as keyof typeof form.data, e.target.value as never)}
                                    />
                                </Field>
                            ))}
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            {[
                                ['general_emails', 'Courriels généraux'],
                                ['billing_emails', 'Courriels de facturation'],
                                ['support_emails', 'Courriels du support'],
                                ['is_default_billing', 'Contact de facturation par défaut'],
                            ].map(([key, label]) => (
                                <label key={key} className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/10 p-4">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(form.data[key as keyof typeof form.data])}
                                        onChange={(e) => form.setData(key as keyof typeof form.data, e.target.checked as never)}
                                        className="h-5 w-5 accent-violet-500"
                                    />
                                    <span className="text-sm font-bold text-slate-300">{label}</span>
                                </label>
                            ))}
                        </div>

                        <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-black">
                            <Save className="h-4 w-4" />
                            Ajouter le contact
                        </button>
                    </form>
                </Card>
            </div>
        </AccountLayout>
    );
}
