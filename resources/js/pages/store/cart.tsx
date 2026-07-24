import { Head, Link, router } from '@inertiajs/react';

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
};

const euro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

export default function Cart({ items, summary }: Props) {
    const updateQuantity = (
        item: CartItem,
        quantity: number,
    ): void => {
        router.patch(
            `/panier/${item.plan_id}`,
            { quantity },
            {
                preserveScroll: true,
            },
        );
    };

    const removeItem = (item: CartItem): void => {
        router.delete(`/panier/${item.plan_id}`, {
            preserveScroll: true,
        });
    };

    const clearCart = (): void => {
        if (!window.confirm('Vider entièrement le panier ?')) {
            return;
        }

        router.delete('/panier');
    };

    return (
        <>
            <Head title="Panier — AstreonHeberg" />

            <div className="min-h-screen bg-[#050b18] text-white">
                <header className="border-b border-white/10 bg-[#07101f]">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                        <Link href="/" className="text-xl font-black">
                            Astreon
                            <span className="text-emerald-400">Heberg</span>
                        </Link>

                        <Link
                            href="/boutique"
                            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold"
                        >
                            Continuer mes achats
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 py-14">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">
                                Commande
                            </p>

                            <h1 className="mt-3 text-4xl font-black">
                                Votre panier
                            </h1>

                            <p className="mt-3 text-slate-400">
                                {summary.quantity} service
                                {summary.quantity > 1 ? 's' : ''} sélectionné
                                {summary.quantity > 1 ? 's' : ''}
                            </p>
                        </div>

                        {items.length > 0 && (
                            <button
                                type="button"
                                onClick={clearCart}
                                className="text-sm font-bold text-red-300 hover:text-red-200"
                            >
                                Vider le panier
                            </button>
                        )}
                    </div>

                    {items.length === 0 ? (
                        <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-20 text-center">
                            <h2 className="text-2xl font-black">
                                Votre panier est vide
                            </h2>

                            <p className="mt-3 text-slate-400">
                                Découvrez nos serveurs Gaming, VPS et
                                hébergements Web.
                            </p>

                            <Link
                                href="/boutique"
                                className="mt-7 inline-flex rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-6 py-3 font-black"
                            >
                                Découvrir les offres
                            </Link>
                        </section>
                    ) : (
                        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
                            <section className="space-y-4">
                                {items.map((item) => (
                                    <article
                                        key={item.plan_id}
                                        className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
                                    >
                                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-emerald-400">
                                                    {item.category.name}
                                                </p>

                                                <h2 className="mt-2 text-xl font-black">
                                                    {item.product.name} —{' '}
                                                    {item.name}
                                                </h2>

                                                <p className="mt-2 text-xs text-slate-500">
                                                    {item.sku}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4">
                                                <label className="flex items-center gap-2">
                                                    <span className="text-sm text-slate-400">
                                                        Quantité
                                                    </span>

                                                    <select
                                                        value={item.quantity}
                                                        onChange={(event) =>
                                                            updateQuantity(
                                                                item,
                                                                Number(
                                                                    event.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2"
                                                    >
                                                        {Array.from(
                                                            { length: 10 },
                                                            (_, index) =>
                                                                index + 1,
                                                        ).map((quantity) => (
                                                            <option
                                                                key={quantity}
                                                                value={quantity}
                                                            >
                                                                {quantity}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>

                                                <div className="min-w-36 text-right">
                                                    <p className="font-black">
                                                        {euro.format(
                                                            item.line_monthly_cents /
                                                                100,
                                                        )}
                                                        <span className="text-xs font-normal text-slate-500">
                                                            {' '}
                                                            / mois
                                                        </span>
                                                    </p>

                                                    {item.line_setup_cents >
                                                        0 && (
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            +{' '}
                                                            {euro.format(
                                                                item.line_setup_cents /
                                                                    100,
                                                            )}{' '}
                                                            installation
                                                        </p>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeItem(item)
                                                    }
                                                    className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-2 text-sm font-bold text-red-300"
                                                >
                                                    Retirer
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </section>

                            <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-7 lg:sticky lg:top-8">
                                <h2 className="text-xl font-black">
                                    Récapitulatif
                                </h2>

                                <dl className="mt-7 space-y-4">
                                    <div className="flex justify-between gap-5">
                                        <dt className="text-slate-400">
                                            Abonnements mensuels
                                        </dt>
                                        <dd className="font-bold">
                                            {euro.format(
                                                summary.monthly_cents / 100,
                                            )}
                                        </dd>
                                    </div>

                                    <div className="flex justify-between gap-5">
                                        <dt className="text-slate-400">
                                            Frais d’installation
                                        </dt>
                                        <dd className="font-bold">
                                            {euro.format(
                                                summary.setup_cents / 100,
                                            )}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="mt-7 border-t border-white/10 pt-6">
                                    <div className="flex items-end justify-between gap-5">
                                        <span className="font-bold">
                                            Total aujourd’hui
                                        </span>

                                        <span className="text-3xl font-black">
                                            {euro.format(
                                                summary.due_today_cents / 100,
                                            )}
                                        </span>
                                    </div>

                                    <p className="mt-3 text-xs leading-5 text-slate-500">
                                        Les services seront renouvelés selon le
                                        cycle de facturation choisi au checkout.
                                    </p>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="mt-7 block rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-5 py-4 text-center font-black"
                                >
                                    Continuer la commande
                                </Link>

                                <p className="mt-4 text-center text-xs text-slate-600">
                                    Le paiement n’est pas encore activé.
                                </p>
                            </aside>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}