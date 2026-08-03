import { Head, Link, router } from '@inertiajs/react';
import {
    Bell,
    CheckCheck,
    ChevronLeft,
    ChevronRight,
    Trash2,
} from 'lucide-react';
import ClientLayout from '@/layouts/client-layout';

type Item = {
    id: number;
    title: string;
    message: string;
    url?: string | null;
    severity: string;
    read_at?: string | null;
    created_at?: string | null;
};

type Pagination = {
    data: Item[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url?: string | null;
    next_page_url?: string | null;
};

export default function ClientNotifications({
    notifications,
}: {
    notifications: Pagination;
}) {
    function open(item: Item) {
        router.patch(
            `/notification-center/${item.id}/read`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => item.url && router.visit(item.url),
            },
        );
    }

    return (
        <ClientLayout
            title="Notifications"
            description="Retrouvez les activités importantes de votre compte, de vos tickets et de vos moyens de paiement."
        >
            <Head title="Notifications" />

            <div className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90">
                <div className="flex flex-col gap-3 border-b border-violet-400/15 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-black">
                            Centre de notifications
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {notifications.total} notification(s)
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            router.post(
                                '/notification-center/read-all',
                                {},
                                { preserveScroll: true },
                            )
                        }
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-violet-400/20 px-4 text-sm font-black text-violet-300"
                    >
                        <CheckCheck className="h-4 w-4" />
                        Tout marquer comme lu
                    </button>
                </div>

                <div className="divide-y divide-violet-400/10 p-2">
                    {notifications.data.map((item) => (
                        <article
                            key={item.id}
                            className={`flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-center ${
                                item.read_at ? 'opacity-65' : 'bg-violet-500/[.06]'
                            }`}
                        >
                            <button
                                type="button"
                                onClick={() => open(item)}
                                className="min-w-0 flex-1 text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <h3 className="truncate font-black">
                                        {item.title}
                                    </h3>
                                    {!item.read_at && (
                                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                                    )}
                                </div>

                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    {item.message}
                                </p>

                                <p className="mt-2 text-xs text-slate-600">
                                    {item.created_at
                                        ? new Date(item.created_at).toLocaleString('fr-FR')
                                        : ''}
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    router.delete(
                                        `/notification-center/${item.id}`,
                                        { preserveScroll: true },
                                    )
                                }
                                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/10 text-rose-300"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </article>
                    ))}

                    {notifications.data.length === 0 && (
                        <div className="py-20 text-center">
                            <Bell className="mx-auto h-9 w-9 text-slate-700" />
                            <p className="mt-4 font-bold text-slate-500">
                                Aucune notification pour le moment.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 border-t border-violet-400/15 p-4">
                    {notifications.prev_page_url && (
                        <Link
                            href={notifications.prev_page_url}
                            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    )}

                    <span className="grid h-10 min-w-14 place-items-center rounded-xl bg-violet-500/10 px-3 text-sm font-black text-violet-200">
                        {notifications.current_page}/{notifications.last_page}
                    </span>

                    {notifications.next_page_url && (
                        <Link
                            href={notifications.next_page_url}
                            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    )}
                </div>
            </div>
        </ClientLayout>
    );
}
