import { Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    Bell,
    CheckCheck,
    CircleAlert,
    LifeBuoy,
    MessageSquare,
    Shield,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type NotificationItem = {
    id: number;
    type: string;
    title: string;
    message: string;
    url?: string | null;
    icon: string;
    severity: string;
    read_at?: string | null;
    created_at?: string | null;
};

type Center = {
    unread_count: number;
    latest: NotificationItem[];
};

type SharedProps = {
    notification_center?: Center;
};

export default function NotificationBell({
    variant,
}: {
    variant: 'client' | 'admin';
}) {
    const shared = usePage<SharedProps>().props.notification_center;
    const [center, setCenter] = useState<Center>(
        shared ?? { unread_count: 0, latest: [] },
    );
    const [open, setOpen] = useState(false);
    const root = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (shared) {
            setCenter(shared);
        }
    }, [shared]);

    useEffect(() => {
        const close = (event: MouseEvent) => {
            if (
                root.current
                && !root.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', close);

        return () => document.removeEventListener('mousedown', close);
    }, []);

    useEffect(() => {
        const refresh = async () => {
            try {
                const response = await fetch('/notification-center/summary', {
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (response.ok) {
                    setCenter(await response.json());
                }
            } catch {
                // Une navigation Inertia actualisera aussi les données.
            }
        };

        refresh();

        const timer = window.setInterval(refresh, 15000);

        return () => window.clearInterval(timer);
    }, []);

    function markAllRead() {
        router.post(
            '/notification-center/read-all',
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    setCenter((current) => ({
                        unread_count: 0,
                        latest: current.latest.map((item) => ({
                            ...item,
                            read_at: item.read_at ?? new Date().toISOString(),
                        })),
                    })),
            },
        );
    }

    function openNotification(item: NotificationItem) {
        router.patch(
            `/notification-center/${item.id}/read`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCenter((current) => ({
                        unread_count: Math.max(
                            0,
                            current.unread_count - (item.read_at ? 0 : 1),
                        ),
                        latest: current.latest.map((entry) =>
                            entry.id === item.id
                                ? {
                                    ...entry,
                                    read_at:
                                        entry.read_at
                                        ?? new Date().toISOString(),
                                }
                                : entry,
                        ),
                    }));
                    setOpen(false);

                    if (item.url) {
                        router.visit(item.url);
                    }
                },
            },
        );
    }

    const allUrl =
        variant === 'admin'
            ? '/admin/notifications'
            : '/client/notifications';

    return (
        <div ref={root} className="relative z-[120]">
            <button
                type="button"
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setOpen((value) => !value);
                }}
                aria-expanded={open}
                aria-label="Ouvrir les notifications"
                className={
                    variant === 'admin'
                        ? 'relative grid h-10 w-10 cursor-pointer place-items-center rounded-xl border border-white/10 bg-[#0d0918] text-slate-300 transition hover:border-violet-400/40 hover:text-white'
                        : 'relative grid h-10 w-10 cursor-pointer place-items-center rounded-xl border border-violet-400/20 bg-[#100a1e] text-slate-300 transition hover:border-violet-400/50 hover:text-white'
                }
            >
                <Bell className="pointer-events-none h-5 w-5" />

                {center.unread_count > 0 && (
                    <span className="pointer-events-none absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white ring-2 ring-[#080612]">
                        {center.unread_count > 9
                            ? '9+'
                            : center.unread_count}
                    </span>
                )}
            </button>

            {open && (
                <div
                    onClick={(event) => event.stopPropagation()}
                    className="fixed left-1/2 top-20 z-[9999] w-[min(92vw,400px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-violet-400/20 bg-[#0d0918] text-white shadow-[0_30px_100px_rgba(0,0,0,.65)] sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-3 sm:translate-x-0"
                >
                    <div className="flex items-center justify-between border-b border-violet-400/15 px-4 py-4">
                        <div>
                            <p className="font-black">Notifications</p>
                            <p className="mt-1 text-xs text-slate-500">
                                {center.unread_count > 0
                                    ? `${center.unread_count} non lue(s)`
                                    : 'Tout est lu'}
                            </p>
                        </div>

                        {center.unread_count > 0 && (
                            <button
                                type="button"
                                onClick={markAllRead}
                                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black text-violet-300 hover:bg-violet-500/10"
                            >
                                <CheckCheck className="h-4 w-4" />
                                Tout lire
                            </button>
                        )}
                    </div>

                    <div className="max-h-[430px] overflow-y-auto p-2">
                        {center.latest.map((item) => {
                            const Icon = iconFor(item.icon);

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => openNotification(item)}
                                    className={`flex w-full gap-3 rounded-xl p-3 text-left transition hover:bg-white/5 ${
                                        item.read_at
                                            ? 'opacity-65'
                                            : 'bg-violet-500/[.07]'
                                    }`}
                                >
                                    <span
                                        className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${severityClass(item.severity)}`}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </span>

                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-center gap-2">
                                            <span className="truncate text-sm font-black">
                                                {item.title}
                                            </span>

                                            {!item.read_at && (
                                                <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                                            )}
                                        </span>

                                        <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-400">
                                            {item.message}
                                        </span>

                                        <span className="mt-2 block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                            {relativeDate(item.created_at)}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}

                        {center.latest.length === 0 && (
                            <div className="px-4 py-10 text-center">
                                <Bell className="mx-auto h-7 w-7 text-slate-700" />
                                <p className="mt-3 text-sm font-bold text-slate-500">
                                    Aucune notification.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-violet-400/15 p-2">
                        <Link
                            href={allUrl}
                            onClick={() => setOpen(false)}
                            className="block rounded-xl px-4 py-3 text-center text-sm font-black text-violet-300 hover:bg-violet-500/10"
                        >
                            Voir toutes les notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

function iconFor(icon: string) {
    return icon === 'ticket'
        ? LifeBuoy
        : icon === 'message'
          ? MessageSquare
          : icon === 'shield'
            ? Shield
            : icon === 'activity'
              ? Activity
              : icon === 'alert'
                ? CircleAlert
                : Bell;
}

function severityClass(severity: string): string {
    return severity === 'danger'
        ? 'bg-rose-500/10 text-rose-300'
        : severity === 'warning'
          ? 'bg-amber-500/10 text-amber-300'
          : severity === 'success'
            ? 'bg-emerald-500/10 text-emerald-300'
            : 'bg-violet-500/10 text-violet-300';
}

function relativeDate(value?: string | null): string {
    if (!value) {
        return '';
    }

    const seconds = Math.max(
        1,
        Math.floor(
            (Date.now() - new Date(value).getTime()) / 1000,
        ),
    );

    if (seconds < 60) {
        return 'À l’instant';
    }

    if (seconds < 3600) {
        return `Il y a ${Math.floor(seconds / 60)} min`;
    }

    if (seconds < 86400) {
        return `Il y a ${Math.floor(seconds / 3600)} h`;
    }

    return new Date(value).toLocaleDateString('fr-FR');
}
