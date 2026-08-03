import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AccountLayout from '../components/account-layout';
import { Card } from '../components/ui';

type Props = {
    email: {
        id: number;
        subject: string;
        recipient: string;
        html_body?: string | null;
        text_body?: string | null;
        sent_at?: string | null;
        created_at: string;
    };
};

export default function EmailHistoryShow({ email }: Props) {
    return (
        <AccountLayout section="account">
            <Head title={email.subject} />

            <Link href="/client/account/emails" className="mb-5 inline-flex items-center gap-2 text-sm font-black text-violet-300">
                <ArrowLeft className="h-4 w-4" />
                Retour aux courriels
            </Link>

            <Card title={email.subject} description={`Envoyé à ${email.recipient}`}>
                {email.html_body ? (
                    <div
                        className="prose prose-invert max-w-none rounded-xl bg-white p-6 text-black"
                        dangerouslySetInnerHTML={{ __html: email.html_body }}
                    />
                ) : (
                    <pre className="whitespace-pre-wrap rounded-xl border border-white/5 bg-black/20 p-5 text-sm text-slate-300">
                        {email.text_body ?? 'Contenu indisponible.'}
                    </pre>
                )}
            </Card>
        </AccountLayout>
    );
}
