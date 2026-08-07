import {
    FormEvent,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    Head,
    Link,
    router,
    useForm,
} from '@inertiajs/react';
import {
    CheckCircle2,
    CreditCard,
    Landmark,
    LockKeyhole,
    ShieldCheck,
    WalletCards,
} from 'lucide-react';

type CartItem = {
    plan_id: number;
    quantity: number;
    name: string;
    sku: string;
    price_monthly_cents: number;
    setup_fee_cents: number;
    line_monthly_cents: number;
    line_setup_cents: number;
    product: {
        name: string | null;
        slug: string | null;
    };
    category: {
        name: string | null;
    };
    options?: {
        ark_edition?: string;
    };
};

type Props = {
    items: CartItem[];
    summary: {
        quantity: number;
        monthly_cents: number;
        setup_cents: number;
        before_discount_cents: number;
        discount_cents: number;
        due_today_cents: number;
    };
    promo: {
        id: number;
        code: string;
        label: string | null;
        type: 'percent' | 'fixed';
        value: number;
        discount_cents: number;
    } | null;
    customer: {
        name: string;
        email: string;
        company: string | null;
    };
    stripeKey: string;
    clientSecret: string;
    paymentIntentId: string;
    wallet: {
        balance_cents: number;
        currency: string;
        can_pay: boolean;
    };
    paypalConfigured: boolean;
};

type PaymentMethod = 'card' | 'paypal' | 'wallet';

type StripeError = {
    message?: string;
};

type StripeResult = {
    error?: StripeError;
    paymentIntent?: {
        id: string;
        status: string;
    };
};

type StripePaymentElement = {
    mount: (selector: string | HTMLElement) => void;
    unmount: () => void;
};

type StripeElements = {
    create: (
        type: 'payment',
    ) => StripePaymentElement;
};

type StripeClient = {
    elements: (
        options: Record<string, unknown>,
    ) => StripeElements;
    confirmPayment: (
        options: Record<string, unknown>,
    ) => Promise<StripeResult>;
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
    const match = document.cookie.match(
        /(?:^|; )XSRF-TOKEN=([^;]*)/,
    );

    return match
        ? decodeURIComponent(match[1])
        : '';
}

async function jsonPost(
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

    const data = await response
        .json()
        .catch(() => ({}));

    if (!response.ok) {
        throw {
            status: response.status,
            data,
        };
    }

    return data;
}

function PaymentCard({
    selected,
    disabled = false,
    title,
    description,
    icon,
    accent = 'violet',
    onClick,
}: {
    selected: boolean;
    disabled?: boolean;
    title: string;
    description: string;
    icon: React.ReactNode;
    accent?: 'violet' | 'blue' | 'emerald';
    onClick: () => void;
}) {
    const selectedClasses = {
        violet:
            'border-violet-300 bg-violet-500/20 shadow-[0_0_32px_rgba(139,92,246,.22)] ring-2 ring-violet-400/35',
        blue:
            'border-blue-300 bg-blue-500/15 shadow-[0_0_32px_rgba(59,130,246,.18)] ring-2 ring-blue-400/30',
        emerald:
            'border-emerald-300 bg-emerald-500/15 shadow-[0_0_32px_rgba(16,185,129,.18)] ring-2 ring-emerald-400/30',
    };

    return (
        <button
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={onClick}
            className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-45 ${
                selected
                    ? selectedClasses[accent]
                    : 'border-violet-400/15 bg-[#0d0819] hover:-translate-y-0.5 hover:border-violet-400/45'
            }`}
        >
            {selected && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-500" />
            )}

            <div className="flex items-start justify-between gap-4">
                <span
                    className={`grid h-11 w-11 place-items-center rounded-xl border ${
                        selected
                            ? 'border-white/20 bg-white/10 text-white'
                            : 'border-violet-400/15 bg-[#130d25] text-violet-300'
                    }`}
                >
                    {icon}
                </span>

                <span
                    className={`grid h-8 w-8 place-items-center rounded-full border ${
                        selected
                            ? 'border-white/25 bg-white/15 text-white'
                            : 'border-violet-400/20 text-slate-600'
                    }`}
                >
                    {selected ? (
                        <CheckCircle2 className="h-5 w-5" />
                    ) : (
                        <span className="h-3 w-3 rounded-full border-2 border-current" />
                    )}
                </span>
            </div>

            <p className="mt-4 font-black text-white">
                {title}
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-400">
                {description}
            </p>

            {selected && (
                <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-white">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Moyen sélectionné
                </span>
            )}
        </button>
    );
}

export default function Checkout({
    items,
    summary,
    promo,
    customer,
    stripeKey,
    clientSecret,
    paymentIntentId,
    wallet,
    paypalConfigured,
}: Props) {
    const form = useForm({
        billing_name: customer.name,
        billing_email: customer.email,
        billing_company:
            customer.company ?? '',
        billing_address: '',
        billing_postal_code: '',
        billing_city: '',
        billing_country: 'FR',
        terms_accepted: false,
    });

    const [checkoutSummary, setCheckoutSummary] =
        useState(summary);

    const [activePromo, setActivePromo] =
        useState(promo);

    const [promoCode, setPromoCode] =
        useState(promo?.code ?? '');

    const [promoBusy, setPromoBusy] =
        useState(false);

    const [promoMessage, setPromoMessage] =
        useState<string | null>(null);

    const [currentClientSecret, setCurrentClientSecret] =
        useState(clientSecret);

    const [currentPaymentIntentId, setCurrentPaymentIntentId] =
        useState(paymentIntentId);

    const [currentWallet, setCurrentWallet] =
        useState(wallet);

    const stripeRef =
        useRef<StripeClient | null>(null);

    const elementsRef =
        useRef<StripeElements | null>(null);

    const paymentElementRef =
        useRef<StripePaymentElement | null>(null);

    const [ready, setReady] =
        useState(false);

    const [paying, setPaying] =
        useState(false);

    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod>('card');

    const [paymentError, setPaymentError] =
        useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setReady(false);

        const mount = () => {
            if (
                cancelled
                || !window.Stripe
                || !stripeKey
                || !clientSecret
            ) {
                return;
            }

            const stripe =
                window.Stripe(stripeKey);

            const elements =
                stripe.elements({
                    clientSecret: currentClientSecret,
                    appearance: {
                        theme: 'night',
                        variables: {
                            colorPrimary: '#9333ea',
                            colorBackground: '#110b20',
                            colorText: '#f8f5ff',
                            colorDanger: '#fb7185',
                            borderRadius: '12px',
                        },
                    },
                });

            const paymentElement =
                elements.create('payment');

            paymentElement.mount(
                '#astreon-payment-element',
            );

            stripeRef.current = stripe;
            elementsRef.current = elements;
            paymentElementRef.current =
                paymentElement;

            setReady(true);
        };

        const existing =
            document.querySelector<HTMLScriptElement>(
                'script[data-astreon-stripe]',
            );

        if (existing) {
            if (window.Stripe) {
                mount();
            } else {
                existing.addEventListener(
                    'load',
                    mount,
                    { once: true },
                );
            }
        } else {
            const script =
                document.createElement('script');

            script.src =
                'https://js.stripe.com/v3/';

            script.async = true;
            script.dataset.astreonStripe =
                'true';

            script.addEventListener(
                'load',
                mount,
                { once: true },
            );

            document.head.appendChild(script);
        }

        return () => {
            cancelled = true;
            paymentElementRef.current?.unmount();
        };
    }, [stripeKey, currentClientSecret]);

    const payload = () => ({
        ...form.data,
    });

    const applyValidationErrors = (
        error: any,
    ) => {
        const errors = error?.data?.errors;

        if (errors) {
            Object.entries(errors).forEach(
                ([key, value]) => {
                    form.setError(
                        key as keyof typeof form.data,
                        Array.isArray(value)
                            ? String(value[0])
                            : String(value),
                    );
                },
            );
        }

        setPaymentError(
            error?.data?.message
                ?? 'Impossible de finaliser le paiement.',
        );
    };

    const applyPromo = async () => {
    if (promoBusy || promoCode.trim() === '') {
        return;
    }

    setPromoBusy(true);
    setPromoMessage(null);
    setPaymentError(null);

    try {
        await jsonPost('/checkout/promo', {
            code: promoCode.trim(),
        });

        /*
         * Le montant Stripe a changé.
         * On recharge le checkout afin de recréer proprement
         * le PaymentIntent et le Payment Element.
         */
        window.location.assign('/checkout');
    } catch (error: any) {
        setPromoMessage(
            error?.data?.errors?.code?.[0]
                ?? error?.data?.message
                ?? 'Ce code promo ne peut pas être appliqué.',
        );

        setPromoBusy(false);
    }
};


    const removePromo = async () => {
        if (promoBusy) {
            return;
        }

        setPromoBusy(true);
        setPromoMessage(null);

        try {
            const data = await jsonPost(
                '/checkout/promo/remove',
                {},
            );

            refreshCheckoutFromPromo(data);
            setPromoCode('');
            setPromoMessage(
                data.message ?? 'Code promo retiré.',
            );
        } catch (error: any) {
            setPromoMessage(
                error?.data?.message
                    ?? 'Impossible de retirer le code promo.',
            );
        } finally {
            setPromoBusy(false);
        }
    };

    const submit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (paying) {
            return;
        }

        setPaying(true);
        setPaymentError(null);
        form.clearErrors();

        try {
            await jsonPost('/checkout', {
                action: 'validate',
                ...payload(),
            });

            if (paymentMethod === 'paypal') {
                if (!paypalConfigured) {
                    setPaymentError(
                        'PayPal n’est pas configuré.',
                    );
                    return;
                }

                router.post(
                    '/checkout/paypal',
                    payload(),
                    {
                        preserveScroll: true,
                        onError: (errors) => {
                            Object.entries(errors)
                                .forEach(
                                    ([key, value]) =>
                                        form.setError(
                                            key as keyof typeof form.data,
                                            String(value),
                                        ),
                                );

                            setPaymentError(
                                'Vérifiez les informations de facturation.',
                            );
                        },
                        onFinish: () =>
                            setPaying(false),
                    },
                );

                return;
            }

            if (paymentMethod === 'wallet') {
                if (!currentWallet.can_pay) {
                    setPaymentError(
                        'Le solde du portefeuille est insuffisant.',
                    );
                    return;
                }

                const finalized =
                    await jsonPost('/checkout', {
                        action: 'wallet',
                        wallet_reference:
                            crypto.randomUUID(),
                        ...payload(),
                    });

                window.location.assign(
                    finalized.redirect
                        ?? '/client/services',
                );

                return;
            }

            if (
                !stripeRef.current
                || !elementsRef.current
                || !ready
            ) {
                setPaymentError(
                    'Le formulaire Stripe n’est pas encore prêt.',
                );
                return;
            }

            const result =
                await stripeRef.current
                    .confirmPayment({
                        elements:
                            elementsRef.current,
                        redirect: 'if_required',
                        confirmParams: {
                            payment_method_data: {
                                billing_details: {
                                    name:
                                        form.data
                                            .billing_name,
                                    email:
                                        form.data
                                            .billing_email,
                                    address: {
                                        line1:
                                            form.data
                                                .billing_address,
                                        postal_code:
                                            form.data
                                                .billing_postal_code,
                                        city:
                                            form.data
                                                .billing_city,
                                        country:
                                            form.data
                                                .billing_country
                                                .toUpperCase(),
                                    },
                                },
                            },
                        },
                    });

            if (result.error) {
                setPaymentError(
                    result.error.message
                        ?? 'Paiement refusé.',
                );
                return;
            }

            if (
                !result.paymentIntent
                || result.paymentIntent.status
                    !== 'succeeded'
            ) {
                setPaymentError(
                    'Le paiement n’a pas été accepté.',
                );
                return;
            }

            const finalized =
                await jsonPost('/checkout', {
                    action: 'finalize',
                    payment_intent_id:
                        currentPaymentIntentId,
                    ...payload(),
                });

            window.location.assign(
                finalized.redirect
                    ?? '/client/services',
            );
        } catch (error: any) {
            applyValidationErrors(error);
        } finally {
            if (paymentMethod !== 'paypal') {
                setPaying(false);
            }
        }
    };

    const buttonLabel = paying
        ? 'Paiement en cours…'
        : paymentMethod === 'paypal'
          ? `Continuer avec PayPal — ${euro.format(
              checkoutSummary.due_today_cents / 100,
          )}`
          : paymentMethod === 'wallet'
            ? `Payer avec le portefeuille — ${euro.format(
                checkoutSummary.due_today_cents / 100,
            )}`
            : `Payer par carte — ${euro.format(
                checkoutSummary.due_today_cents / 100,
            )}`;

    const submitDisabled =
        paying
        || (
            paymentMethod === 'card'
            && !ready
        )
        || (
            paymentMethod === 'paypal'
            && !paypalConfigured
        )
        || (
            paymentMethod === 'wallet'
            && !currentWallet.can_pay
        );

    return (
        <>
            <Head title="Paiement sécurisé — Astreon" />

            <div className="min-h-screen text-slate-100">
                <main className="mx-auto max-w-6xl px-5 py-12">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-purple-400">
                            Checkout sécurisé
                        </p>

                        <h1 className="mt-3 text-4xl font-black">
                            Payer votre commande
                        </h1>

                        <p className="mt-3 text-slate-400">
                            Votre commande sera créée uniquement après confirmation du paiement.
                        </p>
                    </div>

                    <form
                        onSubmit={submit}
                        className="mt-10 grid gap-8 lg:grid-cols-[1fr_390px]"
                    >
                        <section className="space-y-7">
                            <article className="rounded-3xl border border-purple-500/25 bg-[#130d25]/90 p-7 shadow-2xl shadow-purple-950/20">
                                <h2 className="text-xl font-black">
                                    Informations de facturation
                                </h2>

                                <div className="mt-7 grid gap-5 md:grid-cols-2">
                                    <Field
                                        label="Nom complet"
                                        value={
                                            form.data
                                                .billing_name
                                        }
                                        error={
                                            form.errors
                                                .billing_name
                                        }
                                        onChange={(value) =>
                                            form.setData(
                                                'billing_name',
                                                value,
                                            )
                                        }
                                    />

                                    <Field
                                        label="Adresse e-mail"
                                        type="email"
                                        value={
                                            form.data
                                                .billing_email
                                        }
                                        error={
                                            form.errors
                                                .billing_email
                                        }
                                        onChange={(value) =>
                                            form.setData(
                                                'billing_email',
                                                value,
                                            )
                                        }
                                    />

                                    <Field
                                        label="Entreprise (facultatif)"
                                        value={
                                            form.data
                                                .billing_company
                                        }
                                        error={
                                            form.errors
                                                .billing_company
                                        }
                                        onChange={(value) =>
                                            form.setData(
                                                'billing_company',
                                                value,
                                            )
                                        }
                                    />

                                    <Field
                                        label="Pays"
                                        value={
                                            form.data
                                                .billing_country
                                        }
                                        error={
                                            form.errors
                                                .billing_country
                                        }
                                        onChange={(value) =>
                                            form.setData(
                                                'billing_country',
                                                value
                                                    .toUpperCase(),
                                            )
                                        }
                                    />

                                    <div className="md:col-span-2">
                                        <Field
                                            label="Adresse"
                                            value={
                                                form.data
                                                    .billing_address
                                            }
                                            error={
                                                form.errors
                                                    .billing_address
                                            }
                                            onChange={(value) =>
                                                form.setData(
                                                    'billing_address',
                                                    value,
                                                )
                                            }
                                        />
                                    </div>

                                    <Field
                                        label="Code postal"
                                        value={
                                            form.data
                                                .billing_postal_code
                                        }
                                        error={
                                            form.errors
                                                .billing_postal_code
                                        }
                                        onChange={(value) =>
                                            form.setData(
                                                'billing_postal_code',
                                                value,
                                            )
                                        }
                                    />

                                    <Field
                                        label="Ville"
                                        value={
                                            form.data
                                                .billing_city
                                        }
                                        error={
                                            form.errors
                                                .billing_city
                                        }
                                        onChange={(value) =>
                                            form.setData(
                                                'billing_city',
                                                value,
                                            )
                                        }
                                    />
                                </div>
                            </article>

                            <article className="rounded-3xl border border-purple-500/25 bg-[#130d25]/90 p-7">
                                <h2 className="text-xl font-black">
                                    Moyen de paiement
                                </h2>

                                <p className="mt-2 text-sm text-slate-400">
                                    Sélectionnez le moyen à utiliser pour cette commande.
                                </p>

                                <div className="mt-6 grid gap-4 md:grid-cols-3">
                                    <PaymentCard
                                        selected={
                                            paymentMethod
                                            === 'card'
                                        }
                                        title="Carte bancaire"
                                        description="Stripe, Apple Pay et Google Pay selon votre appareil."
                                        icon={
                                            <CreditCard className="h-5 w-5" />
                                        }
                                        onClick={() =>
                                            setPaymentMethod(
                                                'card',
                                            )
                                        }
                                    />

                                    <PaymentCard
                                        selected={
                                            paymentMethod
                                            === 'paypal'
                                        }
                                        disabled={
                                            !paypalConfigured
                                        }
                                        title="PayPal"
                                        description={
                                            paypalConfigured
                                                ? 'Validation sur le site sécurisé PayPal.'
                                                : 'PayPal doit être configuré.'
                                        }
                                        icon={
                                            <Landmark className="h-5 w-5" />
                                        }
                                        accent="blue"
                                        onClick={() =>
                                            setPaymentMethod(
                                                'paypal',
                                            )
                                        }
                                    />

                                    <PaymentCard
                                        selected={
                                            paymentMethod
                                            === 'wallet'
                                        }
                                        disabled={
                                            !currentWallet.can_pay
                                        }
                                        title="Portefeuille Astreon"
                                        description={
                                            currentWallet.can_pay
                                                ? `Solde disponible : ${euro.format(
                                                    currentWallet.balance_cents
                                                        / 100,
                                                )}`
                                                : `Solde insuffisant : ${euro.format(
                                                    currentWallet.balance_cents
                                                        / 100,
                                                )}`
                                        }
                                        icon={
                                            <WalletCards className="h-5 w-5" />
                                        }
                                        accent="emerald"
                                        onClick={() =>
                                            setPaymentMethod(
                                                'wallet',
                                            )
                                        }
                                    />
                                </div>
                            </article>

                            {paymentMethod === 'card' && (
                                <article className="rounded-3xl border border-purple-500/25 bg-[#130d25]/90 p-7 shadow-2xl shadow-purple-950/20">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="h-5 w-5 text-purple-400" />
                                        <h2 className="text-xl font-black">
                                            Carte bancaire
                                        </h2>
                                    </div>

                                    <p className="mt-2 text-sm text-slate-400">
                                        Renseignez votre carte dans le formulaire sécurisé ci-dessous.
                                    </p>

                                    <div
                                        id="astreon-payment-element"
                                        className="mt-6 min-h-40 rounded-2xl border border-purple-500/20 bg-[#0d0819] p-5"
                                    />

                                    {!ready && (
                                        <p className="mt-3 text-sm text-slate-400">
                                            Chargement du paiement sécurisé…
                                        </p>
                                    )}

                                    <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-400">
                                        <span className="flex items-center gap-2">
                                            <LockKeyhole className="h-4 w-4 text-emerald-400" />
                                            Paiement chiffré
                                        </span>

                                        <span className="flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                            Traité par Stripe
                                        </span>
                                    </div>
                                </article>
                            )}

                            {paymentMethod === 'paypal' && (
                                <article className="rounded-3xl border border-blue-400/25 bg-blue-500/5 p-7">
                                    <div className="flex items-start gap-4">
                                        <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-500/15 text-blue-300">
                                            <Landmark className="h-6 w-6" />
                                        </span>

                                        <div>
                                            <h2 className="text-xl font-black">
                                                Paiement PayPal
                                            </h2>

                                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                                Vous serez redirigé vers PayPal pour approuver le paiement, puis ramené automatiquement sur Astreon.
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            )}

                            {paymentMethod === 'wallet' && (
                                <article className="rounded-3xl border border-emerald-400/25 bg-emerald-500/5 p-7">
                                    <div className="flex items-start gap-4">
                                        <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300">
                                            <WalletCards className="h-6 w-6" />
                                        </span>

                                        <div>
                                            <h2 className="text-xl font-black">
                                                Portefeuille Astreon
                                            </h2>

                                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                                Le montant sera débité immédiatement de votre crédit interne.
                                            </p>

                                            <p className="mt-3 font-black text-emerald-300">
                                                Solde après paiement :{' '}
                                                {euro.format(
                                                    (
                                                        currentWallet.balance_cents
                                                        - checkoutSummary.due_today_cents
                                                    ) / 100,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            )}

                            {paymentError && (
                                <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
                                    {paymentError}
                                </div>
                            )}

                            <article className="rounded-3xl border border-purple-500/25 bg-[#130d25]/90 p-7">
                                <h2 className="text-xl font-black">
                                    Services commandés
                                </h2>

                                <div className="mt-5 divide-y divide-purple-500/15">
                                    {items.map((item) => (
                                        <div
                                            key={item.plan_id}
                                            className="flex justify-between gap-6 py-5"
                                        >
                                            <div>
                                                <p className="font-black">
                                                    {item.product.name}
                                                    {' — '}
                                                    {item.name}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {item.sku}
                                                    {' · Quantité '}
                                                    {item.quantity}
                                                </p>

                                                {item.options
                                                    ?.ark_edition && (
                                                    <p className="mt-2 text-xs font-bold text-violet-300">
                                                        {item.options
                                                            .ark_edition
                                                            === 'survival-ascended'
                                                            ? 'ARK: Survival Ascended'
                                                            : 'ARK: Survival Evolved'}
                                                    </p>
                                                )}
                                            </div>

                                            <p className="font-black">
                                                {euro.format(
                                                    (
                                                        item.line_monthly_cents
                                                        + item.line_setup_cents
                                                    ) / 100,
                                                )}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </article>

                            <label className="flex items-start gap-4 rounded-2xl border border-purple-500/25 bg-[#130d25]/90 p-5">
                                <input
                                    type="checkbox"
                                    checked={
                                        form.data
                                            .terms_accepted
                                    }
                                    onChange={(event) =>
                                        form.setData(
                                            'terms_accepted',
                                            event.target
                                                .checked,
                                        )
                                    }
                                    className="mt-1 h-4 w-4 accent-purple-600"
                                />

                                <span>
                                    <span className="font-bold">
                                        J’accepte les conditions générales de vente.
                                    </span>

                                    {form.errors
                                        .terms_accepted && (
                                        <span className="mt-2 block text-sm text-red-300">
                                            {
                                                form.errors
                                                    .terms_accepted
                                            }
                                        </span>
                                    )}
                                </span>
                            </label>
                        </section>

                        <aside className="h-fit rounded-3xl border border-purple-500/30 bg-[#130d25]/95 p-7 shadow-2xl shadow-purple-950/25 lg:sticky lg:top-28">
                            <h2 className="text-xl font-black">
                                Récapitulatif
                            </h2>

                            <div className="mt-6 rounded-2xl border border-violet-400/20 bg-[#0d0819] p-4">
                                <label
                                    htmlFor="promo-code"
                                    className="text-xs font-black uppercase tracking-[.16em] text-violet-300"
                                >
                                    Code promo
                                </label>

                                {activePromo ? (
                                    <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3">
                                        <div className="min-w-0">
                                            <p className="truncate font-black text-emerald-200">
                                                {activePromo.code}
                                            </p>
                                            <p className="mt-1 text-xs text-emerald-300/70">
                                                {activePromo.label
                                                    ?? 'Réduction appliquée'}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={removePromo}
                                            disabled={promoBusy}
                                            className="shrink-0 rounded-lg border border-emerald-300/20 px-3 py-2 text-xs font-black text-emerald-200 transition hover:bg-emerald-400/10 disabled:opacity-50"
                                        >
                                            Retirer
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-3 flex gap-2">
                                        <input
                                            id="promo-code"
                                            value={promoCode}
                                            onChange={(event) =>
                                                setPromoCode(
                                                    event.target.value
                                                        .toUpperCase(),
                                                )
                                            }
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') {
                                                    event.preventDefault();
                                                    void applyPromo();
                                                }
                                            }}
                                            placeholder="ASTREON10"
                                            className="min-w-0 flex-1 rounded-xl border border-violet-400/20 bg-[#130d25] px-4 py-3 text-sm font-black uppercase tracking-wider text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400"
                                        />

                                        <button
                                            type="button"
                                            onClick={applyPromo}
                                            disabled={
                                                promoBusy
                                                || promoCode.trim() === ''
                                            }
                                            className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-black text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {promoBusy
                                                ? '...'
                                                : 'Appliquer'}
                                        </button>
                                    </div>
                                )}

                                {promoMessage && (
                                    <p className={`mt-3 text-xs font-bold ${
                                        activePromo
                                            ? 'text-emerald-300'
                                            : 'text-rose-300'
                                    }`}>
                                        {promoMessage}
                                    </p>
                                )}
                            </div>

                            <dl className="mt-7 space-y-4 text-slate-300">
                                <div className="flex justify-between">
                                    <dt>Abonnements</dt>
                                    <dd className="font-bold text-white">
                                        {euro.format(
                                            checkoutSummary.monthly_cents
                                                / 100,
                                        )}
                                    </dd>
                                </div>

                                <div className="flex justify-between">
                                    <dt>Installation</dt>
                                    <dd className="font-bold text-white">
                                        {euro.format(
                                            checkoutSummary.setup_cents
                                                / 100,
                                        )}
                                    </dd>
                                </div>

                                {checkoutSummary.discount_cents > 0 && (
                                    <div className="flex justify-between text-emerald-300">
                                        <dt>
                                            Réduction
                                            {activePromo
                                                ? ` (${activePromo.code})`
                                                : ''}
                                        </dt>
                                        <dd className="font-black">
                                            - {euro.format(
                                                checkoutSummary.discount_cents
                                                    / 100,
                                            )}
                                        </dd>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <dt>TVA</dt>
                                    <dd className="font-bold text-white">
                                        Calculée ultérieurement
                                    </dd>
                                </div>
                            </dl>

                            <div className="mt-7 border-t border-purple-500/20 pt-6">
                                <div className="flex items-end justify-between">
                                    <span className="font-bold">
                                        Total à payer
                                    </span>

                                    <span className="text-3xl font-black">
                                        {euro.format(
                                            checkoutSummary.due_today_cents
                                                / 100,
                                        )}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitDisabled}
                                className={`mt-7 w-full rounded-xl px-5 py-4 font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50 ${
                                    paymentMethod === 'paypal'
                                        ? 'bg-[#0070ba]'
                                        : paymentMethod === 'wallet'
                                          ? 'bg-gradient-to-r from-emerald-600 to-teal-500'
                                          : 'bg-gradient-to-r from-violet-600 to-purple-500 shadow-purple-900/30'
                                }`}
                            >
                                {buttonLabel}
                            </button>

                            <p className="mt-4 text-center text-xs text-slate-500">
                                La commande apparaîtra après confirmation du paiement.
                            </p>

                            <Link
                                href="/panier"
                                className="mt-4 block text-center text-sm font-bold text-purple-300 hover:text-white"
                            >
                                Retour au panier
                            </Link>
                        </aside>
                    </form>
                </main>
            </div>
        </>
    );
}

type FieldProps = {
    label: string;
    value: string;
    type?: string;
    error?: string;
    onChange: (value: string) => void;
};

function Field({
    label,
    value,
    type = 'text',
    error,
    onChange,
}: FieldProps) {
    return (
        <div>
            <label className="text-sm font-bold text-slate-200">
                {label}
            </label>

            <input
                type={type}
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-purple-500/25 bg-[#0d0819] px-4 py-3 text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
            />

            {error && (
                <p className="mt-2 text-sm text-red-300">
                    {error}
                </p>
            )}
        </div>
    );
}
