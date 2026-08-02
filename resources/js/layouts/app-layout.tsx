import type { BreadcrumbItem } from '@/types';
import ClientLayout from '@/layouts/client-layout';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const title = breadcrumbs.at(-1)?.title ?? 'Mon compte';

    return (
        <ClientLayout title={title} description="Gérez les informations et la sécurité de votre compte Astreon.">
            {children}
        </ClientLayout>
    );
}
