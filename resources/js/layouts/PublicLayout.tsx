import type { ReactNode } from 'react';
import PublicFooter from '@/components/astreon/PublicFooter';
import PublicHeader from '@/components/astreon/PublicHeader';

export default function PublicLayout({ children }: { children: ReactNode }) {
    return <div className="min-h-screen bg-white text-slate-950"><PublicHeader />{children}<PublicFooter /></div>;
}
