import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { Palette, Shield, User } from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';

const items = [
    { title: 'Votre profil', href: edit(), icon: User },
    { title: 'Paramètres de sécurité', href: editSecurity(), icon: Shield },
    { title: 'Apparence', href: editAppearance(), icon: Palette },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
            <aside className="astreon-settings-nav">
                <div className="astreon-settings-nav-title">Votre compte</div>
                {items.map(({ title, href, icon: Icon }) => (
                    <Link
                        key={title}
                        href={href}
                        className={isCurrentOrParentUrl(href) ? 'active' : ''}
                    >
                        <Icon className="h-4 w-4" />
                        {title}
                    </Link>
                ))}
            </aside>
            <section className="astreon-settings-content">{children}</section>
        </div>
    );
}
