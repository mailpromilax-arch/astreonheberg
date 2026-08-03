import { FormEvent, useEffect, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    CreditCard,
    History,
    Landmark,
    LockKeyhole,
    Plus,
    WalletCards,
} from 'lucide-react';
import ClientLayout from '@/layouts/client-layout';

type Transaction = {
    id: number;
    direction: 'credit' | 'debit';
    type: string;
    source: string;
    amount_cents: number;
    balance_after_cents: number;
    description?: string | null;
    created_at?: string | null;
};

type Props = {
    wallet: {
        balance_cents: number;
        currency: string;
    };
    transactions: Transaction[];
    stripeKey: string;
    paypalConfigured: boolean;
    limits: {
        minimum_cents: number;
        maximum_cents: number;
    };
};

type StripeElement = {
    mount: (selector: string) => void;
    unmount: () => void;
};

type StripeElements = {
    create: (type: 'payment') => StripeElement;
};

type StripeClient = {
    elements: (options: Record<string, unknown>) => StripeElements;
    confirmPayment: (
        options: Record<string, unknown>,
    ) => Promise<{
        error?: { message?: string };
        paymentIntent?: { id: string; status: string };
    }>;
};

declare global {
    interface Window {
        Stripe?: (key: string) => StripeClient;
    }
}

const euro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);

    return match ? decodeURIComponent(match[1]) : '';
}

async function postJson(
    url: string,
    payload: Record<string, unknown>,
) {
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': xsrfToken(),
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message ?? 'Une erreur est survenue.',
        );
    }

    return data;
}

export default function WalletIndex({
    wallet,
    transactions,
    stripeKey,
    paypalConfigured,
    limits,
}: Props) {
    const [amount, setAmount] = useState('20');
    const [method, setMethod] = useState<'card' | 'paypal'>('card');
    const [loading, setLoading] = useState(false);
    const [cardReady, setCardReady] = useState(false);
    const [cardError, setCardError] = useState<string | null>(null);
    const [intentId, setIntentId] = useState<string | null>(null);
    const stripeRef = useRef<StripeClient | null>(null);
    const elementsRef = useRef<StripeElements | null>(null);
    const elementRef = useRef<StripeElement | null>(null);

    const amountCents = Math.round(
        Number(amount.replace(',', '.')) * 100,
    );

    useEffect(() => {
        if (document.querySelector('script[data-wallet-stripe]')) {
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        script.dataset.walletStripe = 'true';
        document.head.appendChild(script);
    }, []);

    async function prepareCard() {
        setCardError(null);

        if (
            amountCents < limits.minimum_cents
            || amountCents > limits.maximum_cents
        ) {
            setCardError('Choisissez un montant entre 1 € et 1 000 €.');
            return;
        }

        setLoading(true);

        try {
            const data = await postJson(
                '/client/wallet/stripe/intent',
                { amount_cents: amountCents },
            );

            if (!window.Stripe) {
                throw new Error(
                    'Stripe est encore en cours de chargement.',
                );
            }

            elementRef.current?.unmount();

            const stripe = window.Stripe(stripeKey);
            const elements = stripe.elements({
                clientSecret: data.client_secret,
                appearance: {
                    theme: 'night',
                    variables: {
                        colorPrimary: '#9333ea',
                        colorBackground: '#0d0819',
                        colorText: '#ffffff',
                        colorDanger: '#fb7185',
                        borderRadius: '12px',
                    },
                },
            });

            const element = elements.create('payment');
            element.mount('#wallet-payment-element');

            stripeRef.current = stripe;
            elementsRef.current = elements;
            elementRef.current = element;
            setIntentId(data.payment_intent_id);
            setCardReady(true);
        } catch (error) {
            setCardError(
                error instanceof Error
                    ? error.message
                    : 'Impossible de préparer le paiement.',
            );
        } finally {
            setLoading(false);
        }
    }

    async function confirmCard() {
        if (
            !stripeRef.current
            || !elementsRef.current
            || !intentId
        ) {
            return;
        }

        setLoading(true);
        setCardError(null);

        try {
            const result = await stripeRef.current.confirmPayment({
                elements: elementsRef.current,
                redirect: 'if_required',
            });

            if (result.error) {
                throw new Error(
                    result.error.message
                    ?? 'Le paiement a été refusé.',
                );
            }

            if (result.paymentIntent?.status !== 'succeeded') {
                throw new Error(
                    'Le paiement n’est pas encore confirmé.',
                );
            }

            const data = await postJson(
                '/client/wallet/stripe/confirm',
                { payment_intent_id: intentId },
            );

            window.location.assign(
                data.redirect ?? '/client/wallet',
            );
        } catch (error) {
            setCardError(
                error instanceof Error
                    ? error.message
                    : 'Impossible de confirmer le paiement.',
            );
        } finally {
            setLoading(false);
        }
    }

    function submitPayPal(event: FormEvent) {
        event.preventDefault();

        if (
            !paypalConfigured
            || amountCents < limits.minimum_cents
            || amountCents > limits.maximum_cents
        ) {
            return;
        }

        router.post('/client/wallet/paypal', {
            amount_cents: amountCents,
        });
    }

    return (
        <ClientLayout
            title="Mon portefeuille"
            description="Rechargez votre crédit Astreon et utilisez-le pendant vos commandes."
        >
            <Head title="Portefeuille — Astreon" />

            <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
                <div className="space-y-6">
                    <article className="overflow-hidden rounded-3xl border border-violet-400/20 bg-[#120d21]">
                        <div className="bg-gradient-to-r from-violet-600/25 via-fuchsia-600/10 to-transparent p-7">
                            <div className="flex items-center justify-between gap-5">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[.25em] text-violet-300">
                                        Crédit disponible
                                    </p>
                                    <p className="mt-3 text-5xl font-black text-white">
                                        {euro.format(
                                            wallet.balance_cents / 100,
                                        )}
                                    </p>
                                    <p className="mt-3 text-sm text-slate-400">
                                        Utilisable immédiatement pour payer vos commandes Astreon.
                                    </p>
                                </div>

                                <span className="grid h-16 w-16 place-items-center rounded-2xl border border-violet-300/20 bg-violet-500/15 text-violet-200">
                                    <WalletCards className="h-8 w-8" />
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-violet-400/15 px-7 py-5 text-xs leading-6 text-slate-500">
                            Ce portefeuille est un crédit interne non retirable, non transférable et utilisable uniquement sur Astreon.
                        </div>
                    </article>

                    <article className="rounded-3xl border border-violet-400/20 bg-[#120d21] p-7">
                        <div className="flex items-center gap-3">
                            <History className="h-5 w-5 text-violet-300" />
                            <h2 className="text-xl font-black">
                                Historique
                            </h2>
                        </div>

                        <div className="mt-6 divide-y divide-violet-400/10">
                            {transactions.length === 0 && (
                                <p className="py-10 text-center text-sm text-slate-500">
                                    Aucune transaction pour le moment.
                                </p>
                            )}

                            {transactions.map((transaction) => {
                                const credit =
                                    transaction.direction === 'credit';

                                return (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between gap-5 py-5"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span
                                                className={`grid h-11 w-11 place-items-center rounded-xl ${
                                                    credit
                                                        ? 'bg-emerald-500/10 text-emerald-300'
                                                        : 'bg-rose-500/10 text-rose-300'
                                                }`}
                                            >
                                                {credit ? (
                                                    <ArrowDownLeft className="h-5 w-5" />
                                                ) : (
                                                    <ArrowUpRight className="h-5 w-5" />
                                                )}
                                            </span>

                                            <div>
                                                <p className="font-black">
                                                    {transaction.description
                                                        ?? (credit
                                                            ? 'Crédit'
                                                            : 'Paiement')}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {transaction.source}
                                                    {' · '}
                                                    {transaction.created_at
                                                        ? new Date(
                                                            transaction.created_at,
                                                        ).toLocaleString(
                                                            'fr-FR',
                                                        )
                                                        : '—'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p
                                                className={`font-black ${
                                                    credit
                                                        ? 'text-emerald-300'
                                                        : 'text-rose-300'
                                                }`}
                                            >
                                                {credit ? '+' : '-'}
                                                {euro.format(
                                                    transaction.amount_cents
                                                        / 100,
                                                )}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Solde{' '}
                                                {euro.format(
                                                    transaction.balance_after_cents
                                                        / 100,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </article>
                </div>

                <aside className="h-fit rounded-3xl border border-violet-400/20 bg-[#120d21] p-7 xl:sticky xl:top-28">
                    <div className="flex items-center gap-3">
                        <Plus className="h-5 w-5 text-violet-300" />
                        <h2 className="text-xl font-black">
                            Ajouter de l’argent
                        </h2>
                    </div>

                    <label className="mt-6 block">
                        <span className="text-sm font-bold text-slate-300">
                            Montant
                        </span>
                        <div className="mt-2 flex items-center rounded-xl border border-violet-400/20 bg-[#0d0819] px-4">
                            <input
                                value={amount}
                                onChange={(event) => {
                                    setAmount(event.target.value);
                                    setCardReady(false);
                                    setIntentId(null);
                                    elementRef.current?.unmount();
                                }}
                                inputMode="decimal"
                                className="w-full bg-transparent py-3 text-lg font-black text-white outline-none"
                            />
                            <span className="font-black text-violet-300">
                                €
                            </span>
                        </div>
                    </label>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setMethod('card')}
                            className={`rounded-xl border px-4 py-3 text-sm font-black ${
                                method === 'card'
                                    ? 'border-violet-400 bg-violet-500/15 text-white'
                                    : 'border-violet-400/15 text-slate-400'
                            }`}
                        >
                            <CreditCard className="mx-auto mb-2 h-5 w-5" />
                            Carte
                        </button>

                        <button
                            type="button"
                            onClick={() => setMethod('paypal')}
                            className={`rounded-xl border px-4 py-3 text-sm font-black ${
                                method === 'paypal'
                                    ? 'border-blue-400 bg-blue-500/15 text-white'
                                    : 'border-violet-400/15 text-slate-400'
                            }`}
                        >
                            <Landmark className="mx-auto mb-2 h-5 w-5" />
                            PayPal
                        </button>
                    </div>

                    {method === 'card' ? (
                        <div className="mt-5">
                            {!cardReady && (
                                <button
                                    type="button"
                                    onClick={prepareCard}
                                    disabled={loading}
                                    className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-4 font-black text-white disabled:opacity-50"
                                >
                                    {loading
                                        ? 'Préparation…'
                                        : `Continuer avec ${euro.format(
                                            amountCents / 100 || 0,
                                        )}`}
                                </button>
                            )}

                            <div
                                id="wallet-payment-element"
                                className={cardReady
                                    ? 'mt-5 min-h-40 rounded-2xl border border-violet-400/20 bg-[#0d0819] p-4'
                                    : ''}
                            />

                            {cardReady && (
                                <button
                                    type="button"
                                    onClick={confirmCard}
                                    disabled={loading}
                                    className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-4 font-black text-white disabled:opacity-50"
                                >
                                    {loading
                                        ? 'Paiement…'
                                        : 'Payer et créditer'}
                                </button>
                            )}
                        </div>
                    ) : (
                        <form
                            onSubmit={submitPayPal}
                            className="mt-5"
                        >
                            <button
                                type="submit"
                                disabled={
                                    !paypalConfigured
                                    || loading
                                }
                                className="w-full rounded-xl bg-[#0070ba] px-5 py-4 font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Continuer avec PayPal
                            </button>

                            {!paypalConfigured && (
                                <p className="mt-3 text-sm font-bold text-amber-300">
                                    PayPal doit encore être configuré par l’administrateur.
                                </p>
                            )}
                        </form>
                    )}

                    {cardError && (
                        <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-200">
                            {cardError}
                        </p>
                    )}

                    <div className="mt-6 flex items-start gap-3 border-t border-violet-400/15 pt-5 text-xs leading-6 text-slate-500">
                        <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        Les paiements sont vérifiés côté serveur avant tout crédit du portefeuille.
                    </div>
                </aside>
            </section>
        </ClientLayout>
    );
}
