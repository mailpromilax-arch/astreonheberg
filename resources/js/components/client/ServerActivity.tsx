import { useCallback, useEffect, useState } from 'react';
import { Activity, RefreshCcw } from 'lucide-react';

type Props={serviceId:number};
type Entry={id:string;event:string;description:string;ip:string;timestamp:string;actor:string};
export default function ServerActivity({serviceId}:Props){
 const [items,setItems]=useState<Entry[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 const load=useCallback(async()=>{setLoading(true);setError('');try{const r=await fetch(`/client/services/${serviceId}/activity`,{headers:{Accept:'application/json','X-Requested-With':'XMLHttpRequest'}});const j=await r.json();if(!r.ok)throw new Error(j.message||'Chargement impossible');setItems(j.activity||[])}catch(e){setError(e instanceof Error?e.message:'Erreur inconnue')}finally{setLoading(false)}},[serviceId]);
 useEffect(()=>{void load()},[load]);
 return <div className="astreon-panel-section"><div className="astreon-panel-section-head"><div><h2>Journal d’activité</h2><p>Toutes les actions effectuées sur ce serveur.</p></div><button onClick={()=>void load()}><RefreshCcw/>Actualiser</button></div>{error&&<div className="astreon-panel-alert error">{error}</div>}{loading?<div className="astreon-panel-empty">Chargement…</div>:items.length===0?<div className="astreon-panel-empty">Aucune activité enregistrée.</div>:<div className="astreon-activity-list">{items.map(x=><article key={x.id}><div className="astreon-activity-icon"><Activity/></div><div><strong>{x.actor} — {x.event}</strong><p>{x.description}</p><span>{x.ip||'IP inconnue'} · {new Date(x.timestamp).toLocaleString('fr-FR')}</span></div></article>)}</div>}</div>
}