import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

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
};

type Props = {
    items: CartItem[];
    summary: {
        quantity: number;
        monthly_cents: number;
        setup_cents: number;
        due_today_cents: number;
    };
    customer: {
        name: string;
        email: string;
        company: string | null;
    };
};

const euro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

export default function Checkout({
    items,
    summary,
    customer,
}: Props) {
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

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        form.post('/checkout');
    };

    return (
        <>
            <Head title="Validation de commande — AstreonHeberg" />

            <div className="min-h-screen bg-[#050b18] text-white">
                <header className="border-b border-white/10 bg-[#07101f]">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                        <Link href="/" className="text-xl font-black">
                            Astreon
                            <span className="text-emerald-400">
                                Heberg
                            </span>
                        </Link>

                        <Link
                            href="/panier"
                            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold"
                        >
                            Retour au panier
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 py-14">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">
                            Checkout
                        </p>

                        <h1 className="mt-3 text-4xl font-black">
                            Valider votre commande
                        </h1>

                        <p className="mt-3 text-slate-400">
                            Vérifiez vos informations avant de passer au paiement.
                        </p>
                    </div>

                    <form
                        onSubmit={submit}
                        className="mt-10 grid gap-8 lg:grid-cols-[1fr_390px]"
                    >
                        <section className="space-y-8">
                            <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
                                <h2 className="text-xl font-black">
                                    Informations de facturation
                                </h2>

                                <div className="mt-7 grid gap-5 md:grid-cols-2">
                                    <Field
                                        label="Nom complet"
                                        value={form.data.billing_name}
                                        error={form.errors.billing_name}
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
                                        value={form.data.billing_email}
                                        error={form.errors.billing_email}
                                        onChange={(value) =>
                                            form.setData(
                                                'billing_email',
                                                value,
                                            )
                                        }
                                    />

                                    <Field
                                        label="Entreprise"
                                        value={form.data.billing_company}
                                        error={form.errors.billing_company}
                                        onChange={(value) =>
                                            form.setData(
                                                'billing_company',
                                                value,
                                            )
                                        }
                                    />

                                    <Field
                                        label="Pays"
                                        value={form.data.billing_country}
                                        error={form.errors.billing_country}
                                        onChange={(value) =>
                                            form.setData(
                                                'billing_country',
                                                value.toUpperCase(),
                                            )
                                        }
                                    />

                                    <div className="md:col-span-2">
                                        <Field
                                            label="Adresse"
                                            value={form.data.billing_address}
                                            error={
                                                form.errors.billing_address
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
                                            form.data.billing_postal_code
                                        }
                                        error={
                                            form.errors.billing_postal_code
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
                                        value={form.data.billing_city}
                                        error={form.errors.billing_city}
                                        onChange={(value) =>
                                            form.setData(
                                                'billing_city',
                                                value,
                                            )
                                        }
                                    />
                                </div>
                            </article>

                            <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
                                <h2 className="text-xl font-black">
                                    Services commandés
                                </h2>

                                <div className="mt-6 divide-y divide-white/10">
                                    {items.map((item) => (
                                        <div
                                            key={item.plan_id}
                                            className="flex justify-between gap-6 py-5"
                                        >
                                            <div>
                                                <p className="font-black">
                                                    {item.product.name} —{' '}
                                                    {item.name}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {item.sku} · Quantité{' '}
                                                    {item.quantity}
                                                </p>
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

                            <label className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                                <input
                                    type="checkbox"
                                    checked={
                                        form.data.terms_accepted
                                    }
                                    onChange={(event) =>
                                        form.setData(
                                            'terms_accepted',
                                            event.target.checked,
                                        )
                                    }
                                    className="mt-1"
                                />

                                <span>
                                    <span className="font-bold">
                                        J’accepte les conditions générales
                                        de vente.
                                    </span>

                                    <span className="mt-1 block text-sm text-slate-400">
                                        Vous pourrez les consulter avant le
                                        lancement public.
                                    </span>

                                    {form.errors.terms_accepted && (
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

                        <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-7 lg:sticky lg:top-8">
                            <h2 className="text-xl font-black">
                                Récapitulatif
                            </h2>

                            <dl className="mt-7 space-y-4">
                                <div className="flex justify-between gap-5">
                                    <dt className="text-slate-400">
                                        Abonnements
                                    </dt>
                                    <dd className="font-bold">
                                        {euro.format(
                                            summary.monthly_cents / 100,
                                        )}
                                    </dd>
                                </div>

                                <div className="flex justify-between gap-5">
                                    <dt className="text-slate-400">
                                        Installation
                                    </dt>
                                    <dd className="font-bold">
                                        {euro.format(
                                            summary.setup_cents / 100,
                                        )}
                                    </dd>
                                </div>

                                <div className="flex justify-between gap-5">
                                    <dt className="text-slate-400">
                                        TVA
                                    </dt>
                                    <dd className="font-bold">
                                        Calculée ultérieurement
                                    </dd>
                                </div>
                            </dl>

                            <div className="mt-7 border-t border-white/10 pt-6">
                                <div className="flex items-end justify-between gap-5">
                                    <span className="font-bold">
                                        Total provisoire
                                    </span>

                                    <span className="text-3xl font-black">
                                        {euro.format(
                                            summary.due_today_cents / 100,
                                        )}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="mt-7 w-full rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-5 py-4 font-black disabled:opacity-50"
                            >
                                {form.processing
                                    ? 'Création...'
                                    : 'Créer la commande'}
                            </button>

                            <p className="mt-4 text-center text-xs text-slate-600">
                                Aucun paiement ne sera encore prélevé.
                            </p>
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
            <label className="text-sm font-bold">
                {label}
            </label>

            <input
                type={type}
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-blue-400"
            />

            {error && (
                <p className="mt-2 text-sm text-red-300">
                    {error}
                </p>
            )}
        </div>
    );
}