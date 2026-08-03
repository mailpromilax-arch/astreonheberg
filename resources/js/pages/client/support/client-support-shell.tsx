import type { ReactNode } from 'react';

type Props = {
    children: ReactNode;
};

/**
 * Le site possède déjà son header client global.
 * Ce composant ne doit donc ajouter aucun second menu.
 */
export default function ClientSupportShell({ children }: Props) {
    return <>{children}</>;
}
