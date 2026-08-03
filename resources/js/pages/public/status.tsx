import { Head } from '@inertiajs/react';
import { CheckCircle2, CircleAlert, Clock3, Database, Globe2, Mail, Server, ShieldCheck, WalletCards } from 'lucide-react';
import PublicHeader from '@/components/astreon/PublicHeader';

type ServiceStatus = 'operational' | 'degraded' | 'outage';
type Check = { key: string; label: string; description: string; status: ServiceStatus; message?: string | null; };
type Props = { checkedAt: string; overall: ServiceStatus; checks: Check[]; };

const labels: Record<ServiceStatus, string> = {
    operational: 'Opérationnel',
    degraded: 'Dégradé',
    outage: 'Indisponible',
};

const icons: Record<string, typeof Server> = {
    website: Globe2,
    database: Database,
    pterodactyl: Server,
    stripe: WalletCards,
    paypal: WalletCards,
    mail: Mail,
};

function statusClasses(status: ServiceStatus): string {
    if (status === 'operational') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (status === 'degraded') return 'border-amber-200 bg-amber-50 text-amber-700';
    return 'border-red-200 bg-red-50 text-red-700';
}

export default function Status({ checkedAt, overall, checks }: Props) {
    const operationalCount = checks.filter((check) => check.status === 'operational').length;

    return (
        <>
            <Head title="État des services — Astreon" />
            <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
                <PublicHeader />

                <main className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
                    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                        <div className="bg-slate-950 px-7 py-10 text-white sm:px-10">
                            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <span className="text-xs font-black uppercase tracking-[.22em] text-orange-400">Status Astreon</span>
                                    <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">État des services</h1>
                                    <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                                        Consultez en direct l’état des composants essentiels de la plateforme Astreon.
                                    </p>
                                </div>

                                <div className={`flex items-center gap-4 rounded-2xl border px-5 py-4 ${
                                    overall === 'operational'
                                        ? 'border-emerald-400/25 bg-emerald-400/10'
                                        : overall === 'degraded'
                                          ? 'border-amber-400/25 bg-amber-400/10'
                                          : 'border-red-400/25 bg-red-400/10'
                                }`}>
                                    {overall === 'operational'
                                        ? <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                                        : <CircleAlert className={`h-8 w-8 ${overall === 'degraded' ? 'text-amber-400' : 'text-red-400'}`} />
                                    }
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-wider text-slate-400">État général</p>
                                        <p className="mt-1 text-lg font-black">
                                            {overall === 'operational'
                                                ? 'Tous les systèmes sont opérationnels'
                                                : overall === 'degraded'
                                                  ? 'Certains services sont dégradés'
                                                  : 'Incident en cours'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-5 p-7 sm:grid-cols-3 sm:p-10">
                            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                <ShieldCheck className="h-7 w-7 text-orange-500" />
                                <p className="mt-4 text-3xl font-black">{operationalCount}/{checks.length}</p>
                                <p className="mt-1 text-sm font-bold text-slate-500">Services opérationnels</p>
                            </article>

                            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                <Clock3 className="h-7 w-7 text-orange-500" />
                                <p className="mt-4 text-lg font-black">
                                    {new Date(checkedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </p>
                                <p className="mt-1 text-sm font-bold text-slate-500">Dernière vérification</p>
                            </article>

                            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                <Globe2 className="h-7 w-7 text-orange-500" />
                                <p className="mt-4 text-lg font-black">Surveillance active</p>
                                <p className="mt-1 text-sm font-bold text-slate-500">Vérifications côté serveur</p>
                            </article>
                        </div>
                    </section>

                    <section className="mt-10">
                        <span className="text-xs font-black uppercase tracking-[.2em] text-orange-500">Composants</span>
                        <h2 className="mt-2 text-3xl font-black">Infrastructure et services</h2>

                        <div className="mt-6 grid gap-5 md:grid-cols-2">
                            {checks.map((check) => {
                                const Icon = icons[check.key] ?? Server;

                                return (
                                    <article key={check.key} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <div className="flex items-start justify-between gap-5">
                                            <div className="flex gap-4">
                                                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-100 text-orange-600">
                                                    <Icon className="h-6 w-6" />
                                                </span>
                                                <div>
                                                    <h3 className="text-lg font-black">{check.label}</h3>
                                                    <p className="mt-1 text-sm leading-6 text-slate-500">{check.description}</p>
                                                </div>
                                            </div>
                                            <span className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-black ${statusClasses(check.status)}`}>
                                                {labels[check.status]}
                                            </span>
                                        </div>

                                        {check.message && (
                                            <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                                                {check.message}
                                            </p>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-7 sm:p-9">
                        <div className="flex items-start gap-4">
                            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
                                <CheckCircle2 className="h-6 w-6" />
                            </span>
                            <div>
                                <h2 className="text-xl font-black">Historique des incidents</h2>
                                <p className="mt-2 text-sm leading-7 text-slate-500">
                                    Aucun incident public n’est actuellement signalé. En cas de problème, les informations importantes seront affichées sur cette page.
                                </p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
