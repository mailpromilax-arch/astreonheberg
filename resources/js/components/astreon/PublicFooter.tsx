import { Link } from '@inertiajs/react';
import { MapPin, ShieldCheck } from 'lucide-react';
import AstreonLogo from './AstreonLogo';

export default function PublicFooter() {
    return (
        <footer className="bg-[#111016] text-white">
            <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-4">
                <div className="md:col-span-1">
                    <AstreonLogo dark />
                    <p className="mt-5 text-sm leading-7 text-slate-400">HÃ©bergeur franÃ§ais spÃ©cialisÃ© dans les serveurs Gaming, VPS, Web et solutions Cloud.</p>
                    <div className="mt-5 space-y-2 text-sm text-slate-400">
                        <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-orange-500" />Infrastructure en France</p>
                        <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-orange-500" />Protection anti-DDoS incluse</p>
                    </div>
                </div>
                {[
                    ['Services', ['FiveM', 'Minecraft', 'VPS NVMe', 'HÃ©bergement Web']],
                    ['Liens utiles', ['Panel Gaming', 'phpMyAdmin', 'Ã‰tat des services', 'Ã€ propos']],
                    ['Assistance', ['Ouvrir un ticket', 'Discord', 'Espace client', 'Contact']],
                ].map(([title, links]) => (
                    <div key={title as string}>
                        <h3 className="font-black uppercase tracking-wide">{title}</h3>
                        <div className="mt-5 grid gap-3 text-sm text-slate-400">
                            {(links as string[]).map((label) => <Link key={label} href="/boutique" className="transition hover:text-orange-400">{label}</Link>)}
                        </div>
                    </div>
                ))}
            </div>
            <div className="border-t border-white/10">
                <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>Â© 2026 Astreon. Tous droits rÃ©servÃ©s.</p>
                    <div className="flex gap-5"><Link href="/client/support">CGV & CGU</Link><Link href="/client/support">Mentions lÃ©gales</Link></div>
                </div>
            </div>
        </footer>
    );
}
