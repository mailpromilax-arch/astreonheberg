import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MailOpen } from 'lucide-react';
import AccountLayout from '../components/account-layout';
import { Card } from '../components/ui';

type Email = {
    id: number;
    subject: string;
    recipient: string;
    sent_at?: string | null;
    created_at: string;
    status: string;
};

type Pagination = {
    data: Email[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = { emails: Pagination };

export default function EmailHistoryIndex({ emails }: Props) {
    return (
        <AccountLayout section="account">
            <Head title="Historique des courriels" />

            <Card title="Historique des courriels" description={`${emails.total} message(s)`}>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-violet-400/15">
                            <tr className="text-left text-xs font-black uppercase text-slate-500">
                                <th className="px-4 py-3">Date d’envoi</th>
                                <th className="px-4 py-3">Objet du message</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-violet-400/10">
                            {emails.data.map((email) => (
                                <tr key={email.id}>
                                    <td className="px-4 py-4 text-sm text-slate-500">
                                        {new Date(email.sent_at ?? email.created_at).toLocaleString('fr-FR')}
                                    </td>
                                    <td className="px-4 py-4 text-sm font-bold">
                                        {email.subject}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <Link href={`/client/account/emails/${email.id}`} className="inline-flex h-9 items-center gap-2 rounded-lg bg-violet-500/10 px-3 text-xs font-black text-violet-200">
                                            <MailOpen className="h-4 w-4" />
                                            Voir le message
                                        </Link>
                                    </td>
                                </tr>
                            ))}

                            {emails.data.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-12 text-center text-sm text-slate-500">
                                        Aucun courriel archivé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    {emails.prev_page_url && (
                        <Link href={emails.prev_page_url} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    )}
                    <span className="grid h-10 min-w-12 place-items-center rounded-xl bg-violet-500/10 px-3 text-sm font-black text-violet-200">
                        {emails.current_page}/{emails.last_page}
                    </span>
                    {emails.next_page_url && (
                        <Link href={emails.next_page_url} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10">
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    )}
                </div>
            </Card>
        </AccountLayout>
    );
}
