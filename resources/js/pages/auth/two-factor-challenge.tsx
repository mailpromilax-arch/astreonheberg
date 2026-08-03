import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    KeyRound,
    LifeBuoy,
    ShieldCheck,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

export default function TwoFactorChallenge() {
    const [useRecoveryCode, setUseRecoveryCode] = useState(false);

    const form = useForm({
        code: '',
        recovery_code: '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        form.transform((data) =>
            useRecoveryCode
                ? {
                    recovery_code: data.recovery_code,
                }
                : {
                    code: data.code,
                },
        );

        form.post('/two-factor-challenge', {
            preserveScroll: true,
            onFinish: () => {
                form.reset('code', 'recovery_code');
            },
        });
    }

    return (
        <>
            <Head title="Vérification en deux étapes" />

            <div className="w-full max-w-md">
                <div className="mb-6 text-center">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-500/10 text-violet-300">
                        {useRecoveryCode ? (
                            <LifeBuoy className="h-7 w-7" />
                        ) : (
                            <ShieldCheck className="h-7 w-7" />
                        )}
                    </span>

                    <h1 className="mt-5 text-3xl font-black text-white">
                        Vérification en deux étapes
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                        {useRecoveryCode
                            ? 'Saisissez l’un des codes de récupération enregistrés lors de l’activation de la 2FA.'
                            : 'Ouvrez Google Authenticator, Microsoft Authenticator, Authy ou votre application TOTP, puis saisissez le code à six chiffres.'}
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-6 shadow-2xl"
                >
                    {!useRecoveryCode ? (
                        <label>
                            <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                Code d’authentification
                            </span>

                            <input
                                autoFocus
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                value={form.data.code}
                                onChange={(event) =>
                                    form.setData(
                                        'code',
                                        event.target.value.replace(/\D/g, ''),
                                    )
                                }
                                className="h-14 w-full rounded-xl border border-violet-400/15 bg-black/20 px-4 text-center text-2xl font-black tracking-[.45em] text-white outline-none placeholder:text-slate-700 focus:border-violet-400/50"
                                placeholder="000000"
                            />

                            {form.errors.code && (
                                <p className="mt-2 text-sm font-semibold text-rose-300">
                                    {form.errors.code}
                                </p>
                            )}
                        </label>
                    ) : (
                        <label>
                            <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                Code de récupération
                            </span>

                            <input
                                autoFocus
                                autoComplete="one-time-code"
                                value={form.data.recovery_code}
                                onChange={(event) =>
                                    form.setData(
                                        'recovery_code',
                                        event.target.value,
                                    )
                                }
                                className="h-14 w-full rounded-xl border border-violet-400/15 bg-black/20 px-4 text-center font-mono text-lg font-black text-white outline-none placeholder:text-slate-700 focus:border-violet-400/50"
                                placeholder="xxxx-xxxx-xxxx"
                            />

                            {form.errors.recovery_code && (
                                <p className="mt-2 text-sm font-semibold text-rose-300">
                                    {form.errors.recovery_code}
                                </p>
                            )}
                        </label>
                    )}

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-black text-white disabled:opacity-50"
                    >
                        <KeyRound className="h-4 w-4" />
                        {form.processing
                            ? 'Vérification...'
                            : 'Vérifier et se connecter'}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setUseRecoveryCode((value) => !value);
                            form.clearErrors();
                            form.reset('code', 'recovery_code');
                        }}
                        className="mt-4 w-full text-center text-sm font-black text-violet-300 hover:text-violet-200"
                    >
                        {useRecoveryCode
                            ? 'Utiliser le code de l’application'
                            : 'Utiliser un code de récupération'}
                    </button>
                </form>

                <Link
                    href="/login"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 text-sm font-black text-slate-500 hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour à la connexion
                </Link>
            </div>
        </>
    );
}
