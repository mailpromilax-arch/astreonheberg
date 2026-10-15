<?php
declare(strict_types=1);
namespace App\Services\Pterodactyl;
use App\Models\Panel; use Illuminate\Support\Facades\DB;
final class PterodactylInfrastructureSync {
 public function __construct(private readonly ?Panel $panel=null) {}
 public function sync(?Panel $panel=null): array { $panel=$panel?:$this->panel; if(!$panel) throw new \RuntimeException('Panel requis.'); $client=PterodactylClient::forPanel($panel);$locations=$client->fetchAll('/api/application/locations');$nodes=$client->fetchAll('/api/application/nodes');$servers=$client->fetchAll('/api/application/servers');$lm=[];$nm=[];
  foreach($locations as $r){$a=$r['attributes']??$r;$pid=(int)($a['id']??0);if(!$pid)continue;DB::table('locations')->updateOrInsert(['panel_id'=>$panel->id,'pterodactyl_id'=>$pid],['short'=>$a['short']??null,'name'=>$a['long']??$a['short']??"Location {$pid}",'description'=>$a['long']??null,'updated_at'=>now(),'created_at'=>DB::raw('COALESCE(created_at, CURRENT_TIMESTAMP)')]);$lm[$pid]=(int)DB::table('locations')->where(['panel_id'=>$panel->id,'pterodactyl_id'=>$pid])->value('id');}
  foreach($nodes as $r){$a=$r['attributes']??$r;$pid=(int)($a['id']??0);if(!$pid)continue;$lid=(int)($a['location_id']??data_get($a,'relationships.location.attributes.id',0));DB::table('nodes')->updateOrInsert(['panel_id'=>$panel->id,'pterodactyl_id'=>$pid],['location_id'=>$lm[$lid]??null,'name'=>$a['name']??"Node {$pid}",'fqdn'=>$a['fqdn']??null,'scheme'=>$a['scheme']??'https','status'=>'online','memory_total'=>(int)($a['memory']??0),'disk_total'=>(int)($a['disk']??0),'last_synced_at'=>now(),'raw'=>json_encode($a,JSON_THROW_ON_ERROR),'updated_at'=>now(),'created_at'=>DB::raw('COALESCE(created_at, CURRENT_TIMESTAMP)')]);$nm[$pid]=(int)DB::table('nodes')->where(['panel_id'=>$panel->id,'pterodactyl_id'=>$pid])->value('id');}
  foreach($servers as $r){$a=$r['attributes']??$r;$pid=(int)($a['id']??0);if(!$pid)continue;$luid=null;$email=null;if(($uid=(int)($a['user']??0))){$u=$client->getServer($pid);$email=data_get($u,'attributes.user.email');}$luid=$email?DB::table('users')->whereRaw('LOWER(email)=?',[mb_strtolower($email)])->value('id'):null;$lim=$a['limits']??[];DB::table('servers')->updateOrInsert(['panel_id'=>$panel->id,'pterodactyl_id'=>$pid],['identifier'=>$a['identifier']??null,'uuid'=>$a['uuid']??null,'external_id'=>$a['external_id']??null,'user_id'=>$luid,'pterodactyl_user_id'=>$a['user']??null,'node_id'=>$nm[(int)($a['node']??0)]??null,'name'=>$a['name']??"Serveur {$pid}",'status'=>!empty($a['suspended'])?'suspended':'active','cpu'=>(int)($lim['cpu']??0),'memory'=>(int)($lim['memory']??0),'disk'=>(int)($lim['disk']??0),'suspended'=>(bool)($a['suspended']??false),'last_synced_at'=>now(),'raw'=>json_encode($a,JSON_THROW_ON_ERROR),'updated_at'=>now(),'created_at'=>DB::raw('COALESCE(created_at, CURRENT_TIMESTAMP)')]);}
  // Nettoyage : supprimer les serveurs qui n'existent plus sur Pterodactyl
  $remoteServerIds = collect($servers)->map(fn($r)=>(int)(($r['attributes']??$r)['id']??0))->filter()->values()->all();
  $removed = 0;
  if (!empty($remoteServerIds)) {
   $removed = DB::table('servers')->where('panel_id',$panel->id)->whereNotNull('pterodactyl_id')->whereNotIn('pterodactyl_id',$remoteServerIds)->delete();
  } else {
   // Panel renvoie 0 serveur : on supprime aussi, mais seulement si l'API a répondu sans erreur
   $removed = DB::table('servers')->where('panel_id',$panel->id)->whereNotNull('pterodactyl_id')->delete();
  }
  return ['panel_id'=>$panel->id,'locations'=>count($locations),'nodes'=>count($nodes),'servers'=>count($servers),'linked_users'=>0,'unlinked_users'=>count($servers),'removed_servers'=>$removed];
 }
}
