import { Link } from '@inertiajs/react';

type Props = { compact?: boolean; dark?: boolean };

export default function AstreonLogo({ compact = false }: Props) {
    return (
        <Link href="/" className="inline-flex items-center" aria-label="Astreon — Accueil">
            <img
                src={compact ? '/images/astreon/astreon-icon.png' : '/images/astreon/astreon-logo.png'}
                alt="Astreon"
                className={compact ? 'astreon-global-logo astreon-global-logo--compact' : 'astreon-global-logo'}
            />
        </Link>
    );
}
