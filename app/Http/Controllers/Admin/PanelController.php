<?php
declare(strict_types=1);
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;use App\Models\Panel;use App\Services\Pterodactyl\PterodactylInfrastructureSync;use Illuminate\Http\Request;use Illuminate\Http\RedirectResponse;
final class PanelController extends Controller {
 public function store(Request $r): RedirectResponse { $d=$r->validate(['name'=>'required|string|max:255','url'=>'required|url','api_key'=>'required|string','client_api_key'=>'nullable|string','is_active'=>'boolean']); Panel::create($d);return back()->with('success','Panel ajouté.'); }
 public function update(Request $r,Panel $panel): RedirectResponse { $d=$r->validate(['name'=>'required|string|max:255','url'=>'required|url','api_key'=>'nullable|string','client_api_key'=>'nullable|string','is_active'=>'boolean']);foreach(['api_key','client_api_key'] as $k)if(empty($d[$k]))unset($d[$k]);$panel->update($d);return back()->with('success','Panel modifié.'); }
 public function destroy(Panel $panel): RedirectResponse {$panel->delete();return back()->with('success','Panel supprimé.');}
 public function sync(Panel $panel,PterodactylInfrastructureSync $sync): RedirectResponse {try{$x=$sync->sync($panel);return back()->with('success',"Synchronisation {$panel->name} : {$x['nodes']} nœud(s), {$x['servers']} serveur(s).");}catch(\Throwable $e){report($e);return back()->with('error','Synchronisation impossible.');}}
}
