import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { FormEvent } from 'react';
import AccountLayout from '../components/account-layout';
import { Card, Field, inputClass } from '../components/ui';

type Member = {
    id: number;
    email: string;
    permissions: string[];
    status: string;
    last_login_at?: string | null;
};

type Props = {
    owner: { id: number; name: string; email: string };
    members: Member[];
};

type SharedProps = { flash?: { success?: string } };

const permissions = [
    ['profile', 'Profil et contacts'],
    ['billing', 'Facturation et paiements'],
    ['services', 'Services et serveurs'],
    ['tickets', 'Tickets de support'],
    ['orders', 'Commandes'],
] as const;

export default function MembersIndex({ owner, members }: Props) {
    const flash = usePage<SharedProps>().props.flash;

    const form = useForm({
        email: '',
        permissions: permissions.map(([key]) => key),
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.post('/client/account/members', {
            preserveScroll: true,
            onSuccess: () => form.reset('email'),
        });
    }

    return (
        <AccountLayout section="account">
            <Head title="Gestion des utilisateurs" />

            {flash?.success && (
                <div className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                    {flash.success}
                </div>
            )}

            <div className="space-y-6">
                <Card title="Gestion des utilisateurs" description={`${members.length + 1} utilisateur(s) trouvé(s)`}>
                    <div className="space-y-3">
                        <MemberRow
                            email={owner.email}
                            status="Propriétaire"
                            permissions={['Toutes les autorisations']}
                        />

                        {members.map((member) => (
                            <MemberRow
                                key={member.id}
                                email={member.email}
                                status={member.status}
                                permissions={member.permissions}
                                action={
                                    <button
                                        type="button"
                                        onClick={() => router.delete(`/client/account/members/${member.id}`, { preserveScroll: true })}
                                        className="inline-flex h-9 items-center gap-2 rounded-lg bg-rose-500/10 px-3 text-xs font-black text-rose-300"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Supprimer l’accès
                                    </button>
                                }
                            />
                        ))}
                    </div>
                </Card>

                <Card
                    title="Inviter un nouvel utilisateur"
                    description="Invitez une personne à accéder à votre compte avec des autorisations précises."
                >
                    <form onSubmit={submit} className="space-y-4">
                        <Field label="Adresse courriel">
                            <input
                                type="email"
                                placeholder="nom@exemple.com"
                                className={inputClass}
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                            />
                        </Field>

                        <div className="grid gap-3 md:grid-cols-2">
                            {permissions.map(([key, label]) => (
                                <label key={key} className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/10 p-4">
                                    <input
                                        type="checkbox"
                                        checked={form.data.permissions.includes(key)}
                                        onChange={(e) => {
                                            const next = e.target.checked
                                                ? [...form.data.permissions, key]
                                                : form.data.permissions.filter((item) => item !== key);
                                            form.setData('permissions', next);
                                        }}
                                        className="h-5 w-5 accent-violet-500"
                                    />
                                    <span className="text-sm font-bold text-slate-300">{label}</span>
                                </label>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-black"
                        >
                            <UserPlus className="h-4 w-4" />
                            Envoyer une invitation
                        </button>
                    </form>
                </Card>
            </div>
        </AccountLayout>
    );
}

function MemberRow({
    email,
    status,
    permissions,
    action,
}: {
    email: string;
    status: string;
    permissions: string[];
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4 rounded-xl border border-white/5 bg-black/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-300">
                    <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                    <p className="text-sm font-black">{email}</p>
                    <p className="mt-1 text-xs text-slate-500">
                        {status} · {permissions.join(', ')}
                    </p>
                </div>
            </div>
            {action}
        </div>
    );
}
