import type { ReactNode } from 'react';

export function Card({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-violet-400/15 bg-[#110d20]/90 p-5 sm:p-6">
            <h2 className="text-2xl font-black">{title}</h2>
            {description && (
                <p className="mt-2 text-sm leading-6 text-slate-400">
                    {description}
                </p>
            )}
            <div className="mt-6">{children}</div>
        </section>
    );
}

export function Field({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <label>
            <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                {label}
            </span>
            {children}
        </label>
    );
}

export const inputClass =
    'h-12 w-full rounded-xl border border-violet-400/15 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-400/40';
