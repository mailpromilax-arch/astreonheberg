import type { PropsWithChildren, ReactNode } from 'react';

export default function ClientPageCard({
    children,
    title,
    action,
    className = '',
}: PropsWithChildren<{
    title?: string;
    action?: ReactNode;
    className?: string;
}>) {
    return (
        <section className={`astreon-client-card ${className}`}>
            {(title || action) && (
                <div className="astreon-client-card-head">
                    {title && <h2>{title}</h2>}
                    {action}
                </div>
            )}
            <div className="astreon-client-card-body">{children}</div>
        </section>
    );
}
