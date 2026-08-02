import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';

export default function DashboardRedirect() {
    useEffect(() => {
        router.visit('/client', {
            replace: true,
            preserveScroll: false,
        });
    }, []);

    return (
        <>
            <Head title="Redirection vers votre espace client" />

            <main className="astreon-dashboard-redirect">
                <div className="astreon-dashboard-spinner" />
                <p>Ouverture de votre espace client...</p>
            </main>
        </>
    );
}
