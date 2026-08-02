import { FormEvent, useEffect, useRef, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { CreditCard, LockKeyhole, ShieldCheck } from 'lucide-react';

type CartItem = {
    plan_id: number;
    quantity: number;
    name: string;
    sku: string;
    price_monthly_cents: number;
    setup_fee_cents: number;
    line_monthly_cents: number;
    line_setup_cents: number;
    product: { name: string | null; slug: string | null };
    category: { name: string | null };
};

type Props = {
    items: CartItem[];
    summary: { quantity: number; monthly_cents: number; setup_cents: number; due_today_cents: number };
    customer: { name: string; email: string; company: string | null };
    stripeKey: string;
    clientSecret: string;
    paymentIntentId: string;
};

type StripeError = { message?: string };
type StripeResult = { error?: StripeError; paymentIntent?: { id: string; status: string } };
type StripePaymentElement = { mount: (selector: string | HTMLElement) => void; unmount: () => void };
type StripeElements = { create: (type: 'payment') => StripePaymentElement };
type StripeClient = {
    elements: (options: Record<string, unknown>) => StripeElements;
    confirmPayment: (options: Record<string, unknown>) => Promise<StripeResult>;
};

declare global {
    interface Window { Stripe?: (key: string) => StripeClient }
}

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
}

async function jsonPost(url: string, payload: Record<string, unknown>) {
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
    if (!response.ok) throw { status: response.status, data };
    return data;
}

export default function Checkout({ items, summary, customer, stripeKey, clientSecret, paymentIntentId }: Props) {
    const form = useForm({
        billing_name: customer.name,
        billing_email: customer.email,
        billing_company: customer.company ?? '',
        billing_address: '',
        billing_postal_code: '',
        billing_city: '',
        billing_country: 'FR',
        terms_accepted: false,
    });
    const stripeRef = useRef<StripeClient | null>(null);
    const elementsRef = useRef<StripeElements | null>(null);
    const paymentElementRef = useRef<StripePaymentElement | null>(null);
    const [ready, setReady] = useState(false);
    const [paying, setPaying] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const mount = () => {
            if (cancelled || !window.Stripe || !stripeKey || !clientSecret) return;
            const stripe = window.Stripe(stripeKey);
            const elements = stripe.elements({
                clientSecret,
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
            const paymentElement = elements.create('payment');
            paymentElement.mount('#astreon-payment-element');
            stripeRef.current = stripe;
            elementsRef.current = elements;
            paymentElementRef.current = paymentElement;
            setReady(true);
        };

        const existing = document.querySelector<HTMLScriptElement>('script[data-astreon-stripe]');
        if (existing) {
            if (window.Stripe) mount(); else existing.addEventListener('load', mount, { once: true });
        } else {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.async = true;
            script.dataset.astreonStripe = 'true';
            script.addEventListener('load', mount, { once: true });
            document.head.appendChild(script);
        }

        return () => {
            cancelled = true;
            paymentElementRef.current?.unmount();
        };
    }, [stripeKey, clientSecret]);

    const payload = () => ({ ...form.data });

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!stripeRef.current || !elementsRef.current || !ready || paying) return;

        setPaying(true);
        setPaymentError(null);
        form.clearErrors();

        try {
            await jsonPost('/checkout', { action: 'validate', ...payload() });

            const result = await stripeRef.current.confirmPayment({
                elements: elementsRef.current,
                redirect: 'if_required',
                confirmParams: {
                    payment_method_data: {
                        billing_details: {
                            name: form.data.billing_name,
                            email: form.data.billing_email,
                            address: {
                                line1: form.data.billing_address,
                                postal_code: form.data.billing_postal_code,
                                city: form.data.billing_city,
                                country: form.data.billing_country.toUpperCase(),
                            },
                        },
                    },
                },
            });

            if (result.error) {
                setPaymentError(result.error.message ?? 'Paiement refusé. Vérifiez les informations de votre carte.');
                return;
            }

            if (!result.paymentIntent || result.paymentIntent.status !== 'succeeded') {
                setPaymentError('Le paiement n’a pas été accepté. Réessayez ou utilisez une autre carte.');
                return;
            }

            const finalized = await jsonPost('/checkout', {
                action: 'finalize',
                payment_intent_id: paymentIntentId,
                ...payload(),
            });

            window.location.assign(finalized.redirect ?? '/client/services');
        } catch (error: any) {
            const errors = error?.data?.errors;
            if (errors) {
                Object.entries(errors).forEach(([key, value]) => {
                    form.setError(key as keyof typeof form.data, Array.isArray(value) ? String(value[0]) : String(value));
                });
            }
            setPaymentError(error?.data?.message ?? 'Impossible de finaliser le paiement. Réessayez dans quelques instants.');
        } finally {
            setPaying(false);
        }
    };

    return (
        <>
            <Head title="Paiement sécurisé — AstreonHeberg" />
            <div className="min-h-screen text-slate-100">
                <main className="mx-auto max-w-6xl px-5 py-12">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-purple-400">Checkout sécurisé</p>
                        <h1 className="mt-3 text-4xl font-black">Payer votre commande</h1>
                        <p className="mt-3 text-slate-400">Votre commande sera créée uniquement après l’acceptation du paiement.</p>
                    </div>

                    <form onSubmit={submit} className="mt-10 grid gap-8 lg:grid-cols-[1fr_390px]">
                        <section className="space-y-7">
                            <article className="rounded-3xl border border-purple-500/25 bg-[#130d25]/90 p-7 shadow-2xl shadow-purple-950/20">
                                <h2 className="text-xl font-black">Informations de facturation</h2>
                                <div className="mt-7 grid gap-5 md:grid-cols-2">
                                    <Field label="Nom complet" value={form.data.billing_name} error={form.errors.billing_name} onChange={(v) => form.setData('billing_name', v)} />
                                    <Field label="Adresse e-mail" type="email" value={form.data.billing_email} error={form.errors.billing_email} onChange={(v) => form.setData('billing_email', v)} />
                                    <Field label="Entreprise (facultatif)" value={form.data.billing_company} error={form.errors.billing_company} onChange={(v) => form.setData('billing_company', v)} />
                                    <Field label="Pays" value={form.data.billing_country} error={form.errors.billing_country} onChange={(v) => form.setData('billing_country', v.toUpperCase())} />
                                    <div className="md:col-span-2"><Field label="Adresse" value={form.data.billing_address} error={form.errors.billing_address} onChange={(v) => form.setData('billing_address', v)} /></div>
                                    <Field label="Code postal" value={form.data.billing_postal_code} error={form.errors.billing_postal_code} onChange={(v) => form.setData('billing_postal_code', v)} />
                                    <Field label="Ville" value={form.data.billing_city} error={form.errors.billing_city} onChange={(v) => form.setData('billing_city', v)} />
                                </div>
                            </article>

                            <article className="rounded-3xl border border-purple-500/25 bg-[#130d25]/90 p-7 shadow-2xl shadow-purple-950/20">
                                <div className="flex items-center gap-3"><CreditCard className="h-5 w-5 text-purple-400" /><h2 className="text-xl font-black">Carte bancaire</h2></div>
                                <p className="mt-2 text-sm text-slate-400">Renseignez votre carte dans le formulaire sécurisé ci-dessous.</p>
                                <div id="astreon-payment-element" className="mt-6 min-h-40 rounded-2xl border border-purple-500/20 bg-[#0d0819] p-5" />
                                {!ready && <p className="mt-3 text-sm text-slate-400">Chargement du paiement sécurisé…</p>}
                                {paymentError && <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">{paymentError}</div>}
                                <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-400">
                                    <span className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-emerald-400" />Paiement chiffré</span>
                                    <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" />Carte traitée par Stripe</span>
                                </div>
                            </article>

                            <article className="rounded-3xl border border-purple-500/25 bg-[#130d25]/90 p-7">
                                <h2 className="text-xl font-black">Services commandés</h2>
                                <div className="mt-5 divide-y divide-purple-500/15">
                                    {items.map((item) => (
                                        <div key={item.plan_id} className="flex justify-between gap-6 py-5">
                                            <div><p className="font-black">{item.product.name} — {item.name}</p><p className="mt-1 text-xs text-slate-500">{item.sku} · Quantité {item.quantity}</p></div>
                                            <p className="font-black">{euro.format((item.line_monthly_cents + item.line_setup_cents) / 100)}</p>
                                        </div>
                                    ))}
                                </div>
                            </article>

                            <label className="flex items-start gap-4 rounded-2xl border border-purple-500/25 bg-[#130d25]/90 p-5">
                                <input type="checkbox" checked={form.data.terms_accepted} onChange={(e) => form.setData('terms_accepted', e.target.checked)} className="mt-1 h-4 w-4 accent-purple-600" />
                                <span><span className="font-bold">J’accepte les conditions générales de vente.</span>{form.errors.terms_accepted && <span className="mt-2 block text-sm text-red-300">{form.errors.terms_accepted}</span>}</span>
                            </label>
                        </section>

                        <aside className="h-fit rounded-3xl border border-purple-500/30 bg-[#130d25]/95 p-7 shadow-2xl shadow-purple-950/25 lg:sticky lg:top-28">
                            <h2 className="text-xl font-black">Récapitulatif</h2>
                            <dl className="mt-7 space-y-4 text-slate-300">
                                <div className="flex justify-between"><dt>Abonnements</dt><dd className="font-bold text-white">{euro.format(summary.monthly_cents / 100)}</dd></div>
                                <div className="flex justify-between"><dt>Installation</dt><dd className="font-bold text-white">{euro.format(summary.setup_cents / 100)}</dd></div>
                                <div className="flex justify-between"><dt>TVA</dt><dd className="font-bold text-white">Calculée ultérieurement</dd></div>
                            </dl>
                            <div className="mt-7 border-t border-purple-500/20 pt-6"><div className="flex items-end justify-between"><span className="font-bold">Total à payer</span><span className="text-3xl font-black">{euro.format(summary.due_today_cents / 100)}</span></div></div>
                            <button type="submit" disabled={!ready || paying} className="mt-7 w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 px-5 py-4 font-black text-white shadow-lg shadow-purple-900/30 disabled:cursor-not-allowed disabled:opacity-50">{paying ? 'Paiement en cours…' : `Payer ${euro.format(summary.due_today_cents / 100)}`}</button>
                            <p className="mt-4 text-center text-xs text-slate-500">La commande apparaîtra après confirmation du paiement.</p>
                            <Link href="/panier" className="mt-4 block text-center text-sm font-bold text-purple-300 hover:text-white">Retour au panier</Link>
                        </aside>
                    </form>
                </main>
            </div>
        </>
    );
}

type FieldProps = { label: string; value: string; type?: string; error?: string; onChange: (value: string) => void };
function Field({ label, value, type = 'text', error, onChange }: FieldProps) {
    return <div><label className="text-sm font-bold text-slate-200">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-purple-500/25 bg-[#0d0819] px-4 py-3 text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20" />{error && <p className="mt-2 text-sm text-red-300">{error}</p>}</div>;
}
