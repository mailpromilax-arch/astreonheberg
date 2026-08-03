import { Head, useForm, usePage } from '@inertiajs/react';
import { KeyRound, Save } from 'lucide-react';
import { FormEvent } from 'react';
import AccountLayout from '../components/account-layout';
import { Card, Field, inputClass } from '../components/ui';

type SharedProps = { flash?: { success?: string } };

export default function PasswordIndex() {
    const flash = usePage<SharedProps>().props.flash;
    const form = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.put('/client/account/password', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <AccountLayout section="security">
            <Head title="Modifier le mot de passe" />

            {flash?.success && (
                <div className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                    {flash.success}
                </div>
            )}

            <Card
                title="Modifier le mot de passe"
                description="Utilisez au minimum 12 caractères, avec majuscules, minuscules, chiffres et symboles."
            >
                <form onSubmit={submit} className="max-w-2xl space-y-4">
                    <Field label="Mot de passe actuel">
                        <input type="password" className={inputClass} value={form.data.current_password} onChange={(e) => form.setData('current_password', e.target.value)} />
                    </Field>
                    <Field label="Nouveau mot de passe">
                        <input type="password" className={inputClass} value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} />
                    </Field>
                    <Field label="Confirmer le nouveau mot de passe">
                        <input type="password" className={inputClass} value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} />
                    </Field>

                    <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-black">
                        <Save className="h-4 w-4" />
                        Sauvegarder les modifications
                    </button>
                </form>
            </Card>
        </AccountLayout>
    );
}
