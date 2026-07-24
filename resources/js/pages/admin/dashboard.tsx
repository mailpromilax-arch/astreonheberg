
import { Head, Link, router } from '@inertiajs/react';

type Statistics = {
    customers: number;
    administrators: number;
    categories: number;
    products: number;
    plans: number;
};

type User = {
    id: number;
    name: string;
    email: string;
    status: string;
    created_at: string;
};

type Activity = {
    id: number;
    description: string;
    event: string | null;
    causer_name: string | null;
    created_at: string | null;
};

type Props = {
    statistics: Statistics;
    latestUsers: User[];
    latestActivities: Activity[];
};

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    return dateFormatter.format(new Date(value));
}

const navigation = [
    { label: 'Tableau de bord', href: '/admin' },
    { label: 'Clients', href: '#' },
    { label: 'Catégories', href: '/admin/categories' },
    { label: 'Produits', href: '/admin/products' },
    { label: 'Offres', href: '/admin/plans' },
    { label: 'Commandes', href: '/admin/orders' },
    { label: 'Factures', href: '#' },
    { label: 'Tickets', href: '#' },
    { label: 'Infrastructure', href: '#' },
    { label: 'Journal d’activité', href: '#' },
    { label: 'Paramètres', href: '#' },
];

export default function AdminDashboard({
    statistics,
    latestUsers,
    latestActivities,
}: Props) {
    const logout = (): void => {
        router.post('/logout');
    };

    const cards = [
        {
            label: 'Clients',
            value: statistics.customers,
            description: 'Comptes avec le rôle client',
        },
        {
            label: 'Produits',
            value: statistics.products,
            description: 'Services commercialisés',
        },
        {
            label: 'Offres',
            value: statistics.plans,
            description: 'Plans tarifaires disponibles',
        },
        {
            label: 'Catégories',
            value: statistics.categories,
            description: 'Gaming, VPS et Web',
        },
    ];

    return (
        <>
            <Head title="Administration — AstreonHeberg" />

            <div className="min-h-screen bg-[#050b18] text-white">
                <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-[#07101f] lg:block">
                    <div className="flex h-20 items-center border-b border-white/10 px-7">
                        <Link href="/" className="text-xl font-black">
                            Astreon
                            <span className="text-emerald-400">Heberg</span>
                        </Link>
                    </div>

                    <div className="px-4 py-6">
                        <p className="px-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                            Administration
                        </p>

                        <nav className="mt-5 space-y-1">
                            {navigation.map((item, index) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                        index === 0
                                            ? 'bg-gradient-to-r from-blue-500/20 to-emerald-400/10 text-white'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>

                <div className="lg:pl-72">
                    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/10 bg-[#050b18]/90 px-6 backdrop-blur-xl lg:px-10">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                                Astreon Control Center
                            </p>
                            <h1 className="mt-1 text-xl font-black">
                                Administration
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/5"
                            >
                                Voir le site
                            </Link>

                            <button
                                type="button"
                                onClick={logout}
                                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15"
                            >
                                Déconnexion
                            </button>
                        </div>
                    </header>

                    <main className="px-6 py-10 lg:px-10">
                        <section>
                            <p className="text-sm font-bold text-slate-400">
                                Vue d’ensemble
                            </p>
                            <h2 className="mt-2 text-3xl font-black">
                                Tableau de bord
                            </h2>
                            <p className="mt-3 text-slate-400">
                                Suivez les utilisateurs, le catalogue et les dernières actions réalisées.
                            </p>
                        </section>

                        <section className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {cards.map((card) => (
                                <article
                                    key={card.label}
                                    className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
                                >
                                    <p className="text-sm font-bold text-slate-400">
                                        {card.label}
                                    </p>
                                    <p className="mt-4 text-4xl font-black">
                                        {card.value}
                                    </p>
                                    <p className="mt-3 text-xs leading-5 text-slate-500">
                                        {card.description}
                                    </p>
                                </article>
                            ))}
                        </section>

                        <section className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                            <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
                                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                                    <div>
                                        <h3 className="text-lg font-black">
                                            Derniers utilisateurs
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-400">
                                            Comptes récemment créés
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                                        {statistics.customers} clients
                                    </span>
                                </div>

                                <div className="divide-y divide-white/10">
                                    {latestUsers.length === 0 && (
                                        <p className="px-6 py-10 text-center text-slate-500">
                                            Aucun utilisateur enregistré.
                                        </p>
                                    )}

                                    {latestUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between gap-5 px-6 py-5"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-bold">
                                                    {user.name}
                                                </p>
                                                <p className="mt-1 truncate text-sm text-slate-400">
                                                    {user.email}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                                                        user.status === 'active'
                                                            ? 'bg-emerald-400/10 text-emerald-300'
                                                            : 'bg-amber-400/10 text-amber-300'
                                                    }`}
                                                >
                                                    {user.status}
                                                </span>
                                                <p className="mt-2 text-xs text-slate-500">
                                                    {formatDate(user.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </article>

                            <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
                                <div className="border-b border-white/10 px-6 py-5">
                                    <h3 className="text-lg font-black">
                                        Activité récente
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Journal de sécurité et d’administration
                                    </p>
                                </div>

                                <div className="divide-y divide-white/10">
                                    {latestActivities.length === 0 && (
                                        <p className="px-6 py-10 text-center text-slate-500">
                                            Aucune activité enregistrée.
                                        </p>
                                    )}

                                    {latestActivities.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="px-6 py-5"
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />

                                                <div>
                                                    <p className="text-sm font-bold">
                                                        {activity.description}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {activity.causer_name ??
                                                            'Système'}
                                                    </p>
                                                    <p className="mt-2 text-xs text-slate-600">
                                                        {formatDate(
                                                            activity.created_at,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </article>
                        </section>

                        <section className="mt-8 rounded-3xl border border-blue-400/20 bg-gradient-to-r from-blue-500/10 to-emerald-400/5 p-7">
                            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h3 className="text-xl font-black">
                                        Catalogue AstreonHeberg
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-400">
                                        {statistics.products} produits et{' '}
                                        {statistics.plans} offres sont actuellement
                                        enregistrés.
                                    </p>
                                </div>

                                <Link
                                    href="/offres"
                                    className="rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-5 py-3 text-center text-sm font-black"
                                >
                                    Consulter les offres
                                </Link>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}
