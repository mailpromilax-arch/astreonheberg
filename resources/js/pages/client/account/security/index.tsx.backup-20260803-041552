import { Head, router, useForm } from '@inertiajs/react';
import {
    Check,
    CheckCircle2,
    Copy,
    KeyRound,
    RefreshCw,
    ShieldCheck,
    ShieldOff,
    Smartphone,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import AccountLayout from '../components/account-layout';
import { Card, Field, inputClass } from '../components/ui';

type Props = {
    security: {
        two_factor_enabled: boolean;
        two_factor_confirmed: boolean;
        email_verified: boolean;
        qr_code_svg?: string | null;
        secret_key?: string | null;
        recovery_codes: string[];
    };
    status?: string | null;
};

export default function SecurityIndex({
    security,
    status,
}: Props) {
    const [copiedSecret, setCopiedSecret] = useState(false);
    const [copiedCodes, setCopiedCodes] = useState(false);

    const confirmForm = useForm({ code: '' });

    const cleanQrCode = useMemo(() => {
        if (!security.qr_code_svg) {
            return null;
        }

        return security.qr_code_svg
            .replace(
                /<svg\b([^>]*)>/i,
                '<svg$1 width="360" height="360" style="display:block;width:360px;height:360px;max-width:none;shape-rendering:crispEdges;background:#fff">',
            )
            .replace(
                /fill="[^"]*"/i,
                'fill="#111827"',
            );
    }, [security.qr_code_svg]);

    function enable() {
        router.post(
            '/user/two-factor-authentication',
            {},
            { preserveScroll: true },
        );
    }

    function confirm(event: FormEvent) {
        event.preventDefault();

        confirmForm.post('/user/confirmed-two-factor-authentication', {
            preserveScroll: true,
            onSuccess: () => confirmForm.reset(),
        });
    }

    function disable() {
        if (!window.confirm('Désactiver la double authentification ?')) {
            return;
        }

        router.delete('/user/two-factor-authentication', {
            preserveScroll: true,
        });
    }

    function regenerateCodes() {
        router.post(
            '/user/two-factor-recovery-codes',
            {},
            { preserveScroll: true },
        );
    }

    async function copySecret() {
        if (!security.secret_key) {
            return;
        }

        await navigator.clipboard.writeText(security.secret_key);
        setCopiedSecret(true);
        window.setTimeout(() => setCopiedSecret(false), 1500);
    }

    async function copyCodes() {
        await navigator.clipboard.writeText(
            security.recovery_codes.join('\n'),
        );
        setCopiedCodes(true);
        window.setTimeout(() => setCopiedCodes(false), 1500);
    }

    return (
        <AccountLayout section="security">
            <Head title="Paramètres de sécurité" />

            {status && (
                <div className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                    {status === 'two-factor-authentication-enabled'
                        ? 'Scannez le QR code, puis confirmez avec le code à 6 chiffres.'
                        : status === 'two-factor-authentication-confirmed'
                          ? 'La double authentification est activée.'
                          : status}
                </div>
            )}

            <div className="space-y-6">
                <Card
                    title="Authentification à deux facteurs"
                    description="À chaque connexion, un code généré par Google Authenticator, Microsoft Authenticator, Authy ou une autre application TOTP sera demandé."
                >
                    {!security.two_factor_enabled && (
                        <div className="flex flex-col gap-4 rounded-xl border border-amber-400/20 bg-amber-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <ShieldOff className="h-6 w-6 text-amber-300" />
                                <div>
                                    <p className="font-black">
                                        Double authentification désactivée
                                    </p>
                                    <p className="mt-1 text-sm text-amber-100/70">
                                        Activez-la pour sécuriser les connexions.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={enable}
                                className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-black"
                            >
                                <ShieldCheck className="h-4 w-4" />
                                Activer la 2FA
                            </button>
                        </div>
                    )}

                    {security.two_factor_enabled && (
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-violet-400/15 bg-black/10 p-5 sm:p-7">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="h-6 w-6 text-emerald-300" />
                                    <div>
                                        <p className="font-black">
                                            {security.two_factor_confirmed
                                                ? 'Double authentification active'
                                                : 'Configuration à confirmer'}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Ouvrez votre application d’authentification puis scannez le QR code.
                                        </p>
                                    </div>
                                </div>

                                {cleanQrCode && (
                                    <div className="mt-7 overflow-x-auto">
                                        <div className="inline-flex flex-col items-center rounded-[28px] bg-white p-12 shadow-[0_20px_60px_rgba(0,0,0,.35)]">
                                            <div
                                                aria-label="QR code de configuration 2FA"
                                                className="shrink-0 [&_svg]:block [&_svg]:h-[360px] [&_svg]:w-[360px] [&_svg]:max-w-none"
                                                dangerouslySetInnerHTML={{
                                                    __html: cleanQrCode,
                                                }}
                                            />

                                            <p className="mt-6 max-w-[360px] text-center text-sm font-semibold leading-6 text-slate-700">
                                                Gardez les quatre coins visibles et évitez les reflets sur l’écran.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {security.secret_key && (
                                    <div className="mt-6 max-w-2xl rounded-xl border border-violet-400/15 bg-[#080611] p-4">
                                        <p className="text-xs font-black uppercase tracking-[.18em] text-slate-500">
                                            Saisie manuelle
                                        </p>

                                        <p className="mt-2 text-sm text-slate-400">
                                            Si le scan échoue, choisissez « Saisir une clé de configuration » dans votre application.
                                        </p>

                                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                                            <code className="min-w-0 flex-1 break-all rounded-lg bg-black/30 px-4 py-3 font-mono text-base font-black tracking-[.15em] text-violet-200">
                                                {security.secret_key}
                                            </code>

                                            <button
                                                type="button"
                                                onClick={copySecret}
                                                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-400/20 px-4 text-sm font-black text-violet-200"
                                            >
                                                {copiedSecret ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                                {copiedSecret ? 'Copiée' : 'Copier'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!security.two_factor_confirmed && (
                                <form
                                    onSubmit={confirm}
                                    className="max-w-xl rounded-xl border border-white/5 bg-black/10 p-5"
                                >
                                    <Field label="Code à 6 chiffres">
                                        <input
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            maxLength={6}
                                            className={inputClass}
                                            value={confirmForm.data.code}
                                            onChange={(event) =>
                                                confirmForm.setData(
                                                    'code',
                                                    event.target.value.replace(
                                                        /\D/g,
                                                        '',
                                                    ),
                                                )
                                            }
                                            placeholder="123456"
                                        />
                                    </Field>

                                    {confirmForm.errors.code && (
                                        <p className="mt-2 text-sm text-rose-300">
                                            {confirmForm.errors.code}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={confirmForm.processing}
                                        className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-black disabled:opacity-50"
                                    >
                                        <KeyRound className="h-4 w-4" />
                                        Confirmer et activer
                                    </button>
                                </form>
                            )}

                            {security.two_factor_confirmed
                                && security.recovery_codes.length > 0 && (
                                <div className="rounded-xl border border-white/5 bg-black/10 p-5">
                                    <h3 className="font-black">
                                        Codes de récupération
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Conservez-les hors de votre ordinateur.
                                    </p>

                                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                        {security.recovery_codes.map((code) => (
                                            <code
                                                key={code}
                                                className="rounded-lg border border-violet-400/10 bg-[#080611] px-3 py-2 text-sm text-violet-200"
                                            >
                                                {code}
                                            </code>
                                        ))}
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={copyCodes}
                                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-violet-400/20 px-4 text-sm font-black text-violet-200"
                                        >
                                            <Copy className="h-4 w-4" />
                                            {copiedCodes
                                                ? 'Codes copiés'
                                                : 'Copier les codes'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={regenerateCodes}
                                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-violet-400/20 px-4 text-sm font-black text-violet-200"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                            Régénérer
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={disable}
                                className="inline-flex h-11 items-center gap-2 rounded-xl bg-rose-500/10 px-5 text-sm font-black text-rose-300"
                            >
                                <ShieldOff className="h-4 w-4" />
                                Désactiver la double authentification
                            </button>
                        </div>
                    )}
                </Card>

                <Card title="État du compte">
                    <div className="grid gap-3 md:grid-cols-2">
                        <Status
                            label="Adresse courriel vérifiée"
                            ok={security.email_verified}
                        />
                        <Status
                            label="Protection 2FA"
                            ok={security.two_factor_confirmed}
                        />
                    </div>
                </Card>
            </div>
        </AccountLayout>
    );
}

function Status({
    label,
    ok,
}: {
    label: string;
    ok: boolean;
}) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/10 p-4">
            <CheckCircle2
                className={`h-5 w-5 ${
                    ok ? 'text-emerald-300' : 'text-amber-300'
                }`}
            />
            <span className="text-sm font-black">{label}</span>
        </div>
    );
}
