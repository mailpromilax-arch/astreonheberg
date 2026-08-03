import { Head, Link } from '@inertiajs/react';
import { Activity, Boxes, Check, Cpu, Gamepad2, Globe2, Headphones, MapPin, Network, Rocket, Server, ShieldCheck, Zap } from 'lucide-react';
import PublicLayout from '@/layouts/PublicLayout';

const games = ['FiveM', 'Minecraft Java', 'Minecraft Bedrock', 'ARK', 'Palworld', "Garry's Mod", 'Rust', 'RedM'];
const guarantees = [
    [Activity, 'Haute disponibilité', 'Une infrastructure supervisée pour maintenir vos services accessibles.'],
    [Headphones, 'Assistance réactive', 'Une équipe disponible pour vous accompagner rapidement.'],
    [Rocket, 'Mise en service instantanée', 'Vos services automatisés sont livrés quelques secondes après paiement.'],
    [Cpu, 'Performance maximale', 'CPU haute fréquence, mémoire rapide et stockage NVMe.'],
    [MapPin, 'Hébergement en France', 'Une infrastructure proche de vos utilisateurs et maîtrisée.'],
    [ShieldCheck, 'Anti-DDoS professionnel', 'Filtrage réseau adapté aux services Gaming, VPS et Web.'],
];

export default function Welcome() {
    return (
        <PublicLayout>
            <Head title="Astreon — Gaming, VPS, Web et Cloud" />
            <main>
                <section id="section-0" className="astreon-hero relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_30%,rgba(249,115,22,.18),transparent_32%),radial-gradient(circle_at_20%_80%,rgba(249,115,22,.08),transparent_28%)]" />
                    <div className="astreon-grid absolute inset-0 opacity-40" />
                    <div className="relative mx-auto grid min-h-[690px] max-w-6xl items-center gap-16 px-6 py-20 lg:grid-cols-[1.15fr_.85fr]">
                        <div>
                            <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-300">
                                {['FR Hébergement en France', 'Protection Anti-DDoS', 'Réseau optimisé'].map((label) => <span key={label} className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2">{label}</span>)}
                            </div>
                            <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">Une infrastructure <br />puissante, rapide<br />et <span className="text-orange-500">protégée.</span></h1>
                            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">Astreon propose des solutions d’hébergement performantes pour vos serveurs de jeux, VPS et projets web, avec une infrastructure française et une gestion entièrement automatisée.</p>
                            <div className="mt-9 flex flex-wrap gap-4">
                                <Link href="/boutique" className="astreon-primary-button px-7 py-4"><Server className="h-5 w-5" />Découvrir nos offres</Link>
                                <a href="https://discord.gg/3fZ6xye97x" className="inline-flex items-center gap-2 rounded-2xl border border-indigo-400/30 bg-indigo-500/10 px-7 py-4 font-black text-indigo-100 transition hover:bg-indigo-500/20"><Gamepad2 className="h-5 w-5" />Notre Discord</a>
                            </div>
                            <div className="mt-6 flex flex-wrap gap-6 text-sm text-slate-400"><span>⚡ Livraison automatisée</span><span>✓ Anti-DDoS inclus</span><span>📍 Hébergé en France</span></div>
                        </div>

                        <div className="relative mx-auto w-full max-w-md">
                            <div className="absolute -inset-10 rounded-full bg-orange-500/10 blur-3xl" />
                            <div className="relative overflow-hidden rounded-3xl border border-orange-400/20 bg-[#241b1a]/90 shadow-2xl shadow-orange-950/40">
                                <div className="flex items-center justify-between border-b border-orange-400/20 px-6 py-5"><div className="flex gap-2"><span className="h-3 w-3 rounded-full bg-red-400" /><span className="h-3 w-3 rounded-full bg-amber-400" /><span className="h-3 w-3 rounded-full bg-emerald-400" /></div><div><p className="font-black text-white">Infrastructure Astreon</p><p className="mt-0.5 text-xs text-slate-400">Ptero ULTIMATE · 39,95 € / mois</p></div><span className="text-xs font-bold text-emerald-400">● Opérationnelle</span></div>
                                <div className="space-y-0 p-6 text-sm">{[
                                    ['Processeur', '10 vCPU Ryzen 9 5950X'], ['Mémoire', '64 Go DDR4'], ['Stockage', '170 Go NVMe Gen4'], ['Bande passante', '10 Gbit/s'], ['Serveurs de jeu', 'Illimités'], ['Bases de données', 'Illimitées'], ['Protection', 'Anti-DDoS PRO'], ['Mode', 'Revendeur'],
                                ].map(([a,b]) => <div key={a} className="flex justify-between border-b border-white/10 py-4"><span className="text-slate-400">{a}</span><span className={`font-bold ${b.includes('Illimité') || b.includes('Anti-DDoS') ? 'text-emerald-400' : b.includes('10 Gbit') || b.includes('39,95') ? 'text-violet-400' : 'text-white'}`}>{b}</span></div>)}</div>
                                <div className="space-y-3 px-6 pb-6"><div><div className="mb-2 flex justify-between text-xs text-slate-400"><span>Capacité CPU allouée</span><span>10 vCPU</span></div><div className="h-1.5 rounded-full bg-white/10"><div className="h-full w-[78%] rounded-full bg-emerald-400" /></div></div><div><div className="mb-2 flex justify-between text-xs text-slate-400"><span>Bande passante</span><span>10 Gbit/s</span></div><div className="h-1.5 rounded-full bg-white/10"><div className="h-full w-[88%] rounded-full bg-orange-500" /></div></div></div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="section-1" className="border-b border-slate-200 bg-white py-12"><p className="text-center text-xs font-black uppercase tracking-[.35em] text-slate-400">Technologies utilisées</p><div className="mx-auto mt-8 grid max-w-6xl grid-cols-2 gap-4 px-6 sm:grid-cols-3 lg:grid-cols-6">{['AMD Ryzen', 'NVMe', 'Docker', 'Pterodactyl', 'MySQL', 'Nginx'].map((item) => <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-5 text-center text-sm font-black text-slate-500">{item}</div>)}</div></section>

                <section className="bg-[#f7f8fa] py-24"><div className="mx-auto max-w-6xl px-6"><div className="text-center"><h2 className="astreon-section-title">Une infrastructure conçue pour<br /><span className="font-medium">les projets exigeants</span></h2><p className="astreon-section-copy">Performance, protection et accompagnement pour héberger vos services dans de bonnes conditions.</p></div><div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">{[
                    [Cpu,'Performance','CPU haute fréquence, stockage NVMe et ressources adaptées.'],[ShieldCheck,'Protection','Filtrage du trafic et protection anti-DDoS incluse.'],[Zap,'Simplicité','Livraison rapide, panel clair et gestion automatisée.'],[Headphones,'Accompagnement','Support humain et outils complets depuis votre espace client.']
                ].map(([Icon,title,text]) => <article key={title as string} className="astreon-card"><span className="astreon-icon-box"><Icon className="h-6 w-6" /></span><h3 className="mt-5 text-lg font-black">{title as string}</h3><p className="mt-3 text-sm leading-7 text-slate-500">{text as string}</p></article>)}</div></div></section>

                <section id="section-2" className="bg-white py-24"><div className="mx-auto max-w-6xl px-6"><div className="text-center"><h2 className="astreon-section-title">Nos univers d’hébergement</h2><p className="astreon-section-copy">Choisissez la solution adaptée à votre projet parmi nos gammes performantes.</p></div><div className="mt-12 grid items-center gap-12 lg:grid-cols-2"><div><div className="inline-flex rounded-full border border-orange-500 px-5 py-3 font-bold text-orange-600"><Gamepad2 className="mr-2 h-5 w-5" />Serveurs de jeux</div><h3 className="mt-8 text-3xl font-black">Performance extrême pour vos jeux</h3><p className="mt-4 max-w-xl leading-8 text-slate-500">Profitez d’une infrastructure optimisée, d’un panel complet et d’une livraison automatisée.</p><div className="mt-7 grid gap-3 sm:grid-cols-2">{games.map((game) => <Link key={game} href="/boutique" className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 font-bold shadow-sm transition hover:border-orange-300 hover:text-orange-600"><span>{game}</span><span>→</span></Link>)}</div></div><div className="grid min-h-[390px] place-items-center rounded-[2.5rem] border border-orange-100 bg-[radial-gradient(circle_at_center,rgba(249,115,22,.14),transparent_58%)] shadow-xl shadow-orange-100"><Gamepad2 className="h-24 w-24 text-orange-500" /></div></div></div></section>

                <section id="section-3" className="bg-[#f7f8fa] py-24"><div className="mx-auto max-w-6xl px-6"><div className="text-center"><h2 className="astreon-section-title">Les garanties Astreon</h2><p className="astreon-section-copy">Une plateforme pensée pour la stabilité, la sécurité et la simplicité.</p></div><div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{guarantees.map(([Icon,title,text]) => <article key={title as string} className="astreon-card flex gap-4"><span className="astreon-icon-box shrink-0"><Icon className="h-6 w-6" /></span><div><h3 className="text-lg font-black">{title as string}</h3><p className="mt-2 text-sm leading-7 text-slate-500">{text as string}</p></div></article>)}</div></div></section>

                <section id="section-4" className="bg-white py-24"><div className="mx-auto max-w-5xl px-6 text-center"><h2 className="astreon-section-title">Astreon en <span className="text-orange-500">chiffres</span></h2><p className="astreon-section-copy">Une plateforme en croissance, construite autour de services réellement fonctionnels.</p><div className="mt-12 grid gap-6 md:grid-cols-3">{[['14+','Offres configurables'],['100%','Livraison automatisée'],['24/7','Monitoring serveur']].map(([value,label]) => <div key={label} className="rounded-2xl border border-slate-200 p-10"><p className="text-5xl font-medium">{value}</p><p className="mt-3 font-bold text-slate-500">{label}</p></div>)}</div></div></section>

                <section id="section-5" className="bg-[#f7f8fa] py-24"><div className="mx-auto max-w-6xl px-6 text-center"><h2 className="astreon-section-title">Ils nous font confiance</h2><p className="astreon-section-copy">Une expérience simple, rapide et adaptée aux communautés.</p><div className="mt-12 grid gap-6 md:grid-cols-3">{[['Lucas V.','Serveur FiveM stable et panel très simple à utiliser.'],['Sarah L.','Installation rapide et ressources conformes à l’offre.'],['Nicolas F.','Les outils fichiers, bases et sauvegardes sont très pratiques.']].map(([name,text]) => <article key={name} className="astreon-card text-left"><div className="flex items-center justify-between"><div><p className="font-black">{name}</p><p className="text-sm text-slate-400">Client Astreon</p></div><p className="text-amber-400">★★★★★</p></div><p className="mt-6 italic leading-7 text-slate-500">“{text}”</p></article>)}</div></div></section>

                <section id="section-6" className="bg-white py-24"><div className="mx-auto max-w-6xl px-6 text-center"><h2 className="astreon-section-title">Notre infrastructure réseau</h2><p className="astreon-section-copy">Une architecture française renforcée pour offrir stabilité, faible latence et protection.</p><div className="mt-12 grid gap-7 md:grid-cols-3">{[
                    [MapPin,'Infrastructure française',['Faible latence','Réseau optimisé','Services proches de vos clients']], [ShieldCheck,'Protection Anti-DDoS',['Filtrage du trafic','Adapté Gaming & VPS','Protection intégrée']], [Network,'Réseau haute capacité',['Ports dédiés','Monitoring temps réel','Allocations supplémentaires']]
                ].map(([Icon,title,items]) => <article key={title as string} className="astreon-card text-left"><span className="astreon-icon-box"><Icon className="h-6 w-6" /></span><h3 className="mt-5 text-lg font-black">{title as string}</h3><div className="mt-5 space-y-3">{(items as string[]).map(item => <p key={item} className="flex gap-2 border-b border-slate-100 pb-3 text-sm text-slate-500"><Check className="h-4 w-4 text-emerald-500" />{item}</p>)}</div></article>)}</div></div></section>
            </main>
        </PublicLayout>
    );
}
