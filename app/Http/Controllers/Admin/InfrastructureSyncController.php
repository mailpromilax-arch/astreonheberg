<?php
declare(strict_types=1);
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;use App\Models\Panel;use App\Services\Pterodactyl\PterodactylInfrastructureSync;use Illuminate\Http\Request;use Illuminate\Http\RedirectResponse;
final class InfrastructureSyncController extends Controller { public function __invoke(Request $r,PterodactylInfrastructureSync $sync): RedirectResponse { $panels=Panel::where('is_active',true)->get();if($panels->isEmpty()){$panels=collect([Panel::firstOrCreate(['name'=>'Panel legacy'],['url'=>config('services.pterodactyl.url'),'api_key'=>config('services.pterodactyl.application_key'),'client_api_key'=>config('services.pterodactyl.client_key'),'is_active'=>true])]);}try{foreach($panels as $panel)$sync->sync($panel);return back()->with('success',$panels->count().' panel(s) synchronisé(s).');}catch(\Throwable $e){report($e);return back()->with('error','Synchronisation impossible.');}}}
