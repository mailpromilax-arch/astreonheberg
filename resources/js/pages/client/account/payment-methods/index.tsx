import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    CreditCard,
    ExternalLink,
    Star,
    Trash2,
} from 'lucide-react';
import AccountLayout from '../components/account-layout';
import { Card } from '../components/ui';

type Method = {
    id: string;
    brand: string;
    last4: string;
    exp_month?: number | null;
    exp_year?: number | null;
    holder_name?: string | null;
    is_default: boolean;
};

type Props = {
    methods: Method[];
    stripeConfigured: boolean;
    billingError?: string | null;
    setupCompleted?: boolean;
};

type SharedProps = {
    flash?: {
        success?: string;
        error?: string;
    };
};

export default function PaymentMethodsIndex({
    methods,
    stripeConfigured,
    billingError,
    setupCompleted,
}: Props) {
    const flash = usePage<SharedProps>().props.flash;

    function addCard() {
        router.post(
            '/client/account/payment-methods/setup',
            {},
            { preserveScroll: true },
        );
    }

    function makeDefault(method: Method) {
        router.patch(
            `/client/account/payment-methods/${method.id}/default`,
            {},
            { preserveScroll: true },
        );
    }

    function remove(method: Method) {
        if (
            !window.confirm(
                `Supprimer la carte ${method.brand.toUpperCase()} •••• ${method.last4} ?`,
            )
        ) {
            return;
        }

        router.delete(
            `/client/account/payment-methods/${method.id}`,
            { preserveScroll: true },
        );
    }

    return (
        <AccountLayout section="account">
            <Head title="Modes de paiement" />

            {(flash?.success || setupCompleted) && (
                <div className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                    {flash?.success
                        ?? 'La carte bancaire a été enregistrée et définie par défaut.'}
                </div>
            )}

            {(flash?.error || billingError) && (
                <div className="mb-5 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-200">
                    {flash?.error ?? billingError}
                </div>
            )}

            <Card
                title="Modes de paiement"
                description="Ajoutez et gérez vos cartes depuis la page de paiement sécurisée Stripe. Astreon ne stocke jamais le numéro complet ni le cryptogramme."
            >
                {stripeConfigured ? (
                    <button
                        type="button"
                        onClick={addCard}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-black"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Ajouter une carte bancaire
                    </button>
                ) : (
                    <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                        Stripe n’est pas configuré. Ajoutez STRIPE_KEY et
                        STRIPE_SECRET dans le fichier .env.
                    </div>
                )}

                <div className="mt-6 space-y-3">
                    {methods.map((method) => (
                        <article
                            key={method.id}
                            className="flex flex-col gap-4 rounded-xl border border-white/5 bg-black/10 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-300">
                                    <CreditCard className="h-5 w-5" />
                                </span>

                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-black uppercase">
                                            {method.brand} •••• {method.last4}
                                        </p>

                                        {method.is_default && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase text-emerald-300">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Par défaut
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Expiration {String(method.exp_month ?? '--').padStart(2, '0')}/{method.exp_year ?? '----'}
                                        {method.holder_name
                                            ? ` · ${method.holder_name}`
                                            : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {!method.is_default && (
                                    <button
                                        type="button"
                                        onClick={() => makeDefault(method)}
                                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-violet-400/20 px-4 text-xs font-black text-violet-200"
                                    >
                                        <Star className="h-4 w-4" />
                                        Définir par défaut
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => remove(method)}
                                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-500/10 px-4 text-xs font-black text-rose-300"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Supprimer
                                </button>
                            </div>
                        </article>
                    ))}

                    {methods.length === 0 && (
                        <div className="rounded-xl border border-dashed border-violet-400/20 p-10 text-center">
                            <CreditCard className="mx-auto h-8 w-8 text-violet-300/60" />
                            <p className="mt-3 text-sm font-bold text-slate-400">
                                Aucun moyen de paiement enregistré.
                            </p>
                            <p className="mt-1 text-xs text-slate-600">
                                Cliquez sur « Ajouter une carte bancaire ».
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </AccountLayout>
    );
}
