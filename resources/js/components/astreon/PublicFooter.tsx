import { Link } from '@inertiajs/react';
import { MapPin, ShieldCheck } from 'lucide-react';
import AstreonLogo from './AstreonLogo';

const columns = [
    {
        title: 'Services',
        links: [
            ['FiveM', '/boutique/fivem'],
            ['Minecraft Java', '/boutique/minecraft-java'],
            ['Minecraft Bedrock', '/boutique/minecraft-bedrock'],
            ['VPS Cloud', '/boutique/categorie/vps'],
            ['Hébergement Web', '/boutique/hebergement-web'],
        ],
    },
    {
        title: 'Liens utiles',
        links: [
            ['Boutique', '/boutique'],
            ['État des services', '/status'],
            ['À propos', '/a-propos'],
            ['Espace client', '/client'],
        ],
    },
    {
        title: 'Assistance',
        links: [
            ['Ouvrir un ticket', '/client/support'],
            ['Discord', 'https://discord.gg/3fZ6xye97x'],
            ['Nous contacter', 'https://discord.gg/3fZ6xye97x'],
        ],
    },
] as const;

export default function PublicFooter() {
    return (
        <footer className="bg-[#111016] text-white">
            <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-6 sm:py-16 md:grid-cols-2 lg:grid-cols-4">
                <div>
                    <AstreonLogo dark />
                    <p className="mt-5 text-sm leading-7 text-slate-400">
                        Hébergeur français spécialisé dans les serveurs Gaming,
                        VPS, Web et solutions Cloud.
                    </p>
                    <div className="mt-5 space-y-3 text-sm text-slate-400">
                        <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
                            Infrastructure en France
                        </p>
                        <p className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 shrink-0 text-orange-500" />
                            Protection anti-DDoS incluse
                        </p>
                    </div>
                </div>

                {columns.map((column) => (
                    <div key={column.title}>
                        <h3 className="font-black uppercase tracking-wide">
                            {column.title}
                        </h3>
                        <div className="mt-5 grid gap-3 text-sm text-slate-400">
                            {column.links.map(([label, href]) =>
                                href.startsWith('http') ? (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-fit transition hover:text-orange-400"
                                    >
                                        {label}
                                    </a>
                                ) : (
                                    <Link
                                        key={label}
                                        href={href}
                                        className="w-fit transition hover:text-orange-400"
                                    >
                                        {label}
                                    </Link>
                                ),
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-white/10">
                <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <p>© 2026 Astreon. Tous droits réservés.</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                        <Link href="/client/support">CGV & CGU</Link>
                        <Link href="/client/support">Mentions légales</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
