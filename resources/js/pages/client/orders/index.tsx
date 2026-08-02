import { Link } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import ClientLayout from '@/layouts/client-layout';

type Order = { id:number; reference:string; status:string; total_cents:number; created_at:string; items_count:number };
type Pagination = { data:Order[]; current_page:number; last_page:number; prev_page_url:string|null; next_page_url:string|null };

const euro = new Intl.NumberFormat('fr-FR', { style:'currency', currency:'EUR' });
const date = new Intl.DateTimeFormat('fr-FR', { dateStyle:'medium', timeStyle:'short' });

export default function ClientOrders({ orders }: { orders: Pagination }) {
    return (
        <ClientLayout title="Mes commandes" description="Suivez vos commandes, paiements et déploiements.">
            <section className="astreon-client-card overflow-hidden">
                <div className="astreon-table-head">
                    <span>Commande</span><span>Articles</span><span>Date</span><span>Montant</span><span>Statut</span>
                </div>
                {orders.data.map(order => (
                    <Link key={order.id} href={`/client/orders/${order.id}`} className="astreon-order-row">
                        <div><FileText /><strong>{order.reference}</strong></div>
                        <span>{order.items_count}</span>
                        <span>{date.format(new Date(order.created_at))}</span>
                        <strong>{euro.format(order.total_cents / 100)}</strong>
                        <span className={`astreon-status astreon-status-${order.status}`}>{order.status}</span>
                    </Link>
                ))}
                {orders.data.length === 0 && <div className="astreon-empty-state"><FileText /><h2>Aucune commande</h2><p>Vos futures commandes apparaîtront ici.</p></div>}
            </section>
            <div className="mt-5 flex justify-between">
                {orders.prev_page_url ? <Link href={orders.prev_page_url} className="astreon-outline-button">Précédent</Link> : <span />}
                {orders.next_page_url && <Link href={orders.next_page_url} className="astreon-outline-button">Suivant</Link>}
            </div>
        </ClientLayout>
    );
}
