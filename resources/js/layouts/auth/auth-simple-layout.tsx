import { Link } from '@inertiajs/react';
import type { AuthLayoutProps } from '@/types';
import AstreonLogo from '@/components/astreon/AstreonLogo';

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
            <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-[82px] max-w-5xl items-center justify-between px-5"><AstreonLogo /><div className="flex items-center gap-3"><Link href="/" className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold">Accueil</Link><Link href="/register" className="astreon-primary-button">Créer un compte</Link></div></div></header>
            <main className="mx-auto flex min-h-[590px] max-w-5xl items-start justify-center px-5 py-14">
                <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
                    <div className="border-b border-slate-100 px-7 py-6"><h1 className="text-2xl font-black">{title}</h1><p className="mt-2 text-sm text-slate-500">{description}</p></div>
                    <div className="p-7">{children}</div>
                </div>
            </main>
            <footer className="bg-[#3e3e3e] py-12 text-center text-sm text-white">Copyright © 2026 Astreon. Tous droits réservés.</footer>
        </div>
    );
}
