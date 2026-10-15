<?php
declare(strict_types=1);
namespace App\Services\Pterodactyl;
use App\Models\Panel;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;
class PterodactylClient {
 public function __construct(private readonly ?Panel $panel=null) {}
 public static function forPanel(Panel $panel): self { return new self($panel); }
 private function url(): string { return rtrim((string)($this->panel?->url ?? config('services.pterodactyl.url') ?? env('PTERODACTYL_URL')), '/'); }
 private function appKey(): string { return (string)($this->panel?->api_key ?? config('services.pterodactyl.application_key') ?? env('PTERODACTYL_APPLICATION_API_KEY')); }
 private function clientKey(): string { return (string)($this->panel?->client_api_key ?? config('services.pterodactyl.client_key') ?? env('PTERODACTYL_CLIENT_API_KEY')); }
 public function forCurrentPanel(): self { return new self($this->panel); }
 public function listNodes(): array { return $this->request()->get('/api/application/nodes')->throw()->json(); }
 public function listAllocations(int $nodeId,bool $onlyAvailable=false): array { return $this->request()->get("/api/application/nodes/{$nodeId}/allocations",$onlyAvailable?['filter'=>['server_id'=>0]]:[])->throw()->json(); }
 public function listNests(): array { return $this->request()->get('/api/application/nests')->throw()->json(); }
 public function getNest(int $id,bool $includeEggs=true): array { return $this->request()->get("/api/application/nests/{$id}",$includeEggs?['include'=>'eggs']:[])->throw()->json(); }
 public function getEgg(int $nestId,int $eggId,bool $includeVariables=true): array { return $this->request()->get("/api/application/nests/{$nestId}/eggs/{$eggId}",$includeVariables?['include'=>'variables']:[])->throw()->json(); }
 public function findUserByExternalId(string $id): ?array { try { return $this->request()->get('/api/application/users/external/'.urlencode($id))->throw()->json(); } catch (\Illuminate\Http\Client\RequestException $e) { if ($e->response->status()===404) { return null; } throw $e; } }
 public function findUserByEmail(string $email): ?array { $u=$this->request()->get('/api/application/users',['filter'=>['email'=>$email]])->throw()->json(); $u=data_get($u,'data.0'); return is_array($u)?$u:null; }
 public function createUser(array $data): array { return $this->request()->post('/api/application/users',$data)->throw()->json(); }
 public function createServer(array $data): array { return $this->request()->post('/api/application/servers',$data)->throw()->json(); }
 public function getServer(int $id): array { return $this->request()->get("/api/application/servers/{$id}")->throw()->json(); }
 public function suspendServer(int $id): void { $this->request()->post("/api/application/servers/{$id}/suspend")->throw(); }
 public function unsuspendServer(int $id): void { $this->request()->post("/api/application/servers/{$id}/unsuspend")->throw(); }
 public function fetchAll(string $endpoint): array { $page=1;$all=[]; do { $r=$this->request()->get($endpoint,['page'=>$page,'per_page'=>100,'include'=>'location'])->throw()->json();$all=array_merge($all,$r['data']??[]);$current=(int)data_get($r,'meta.pagination.current_page',$page);$total=(int)data_get($r,'meta.pagination.total_pages',$current);$page++; } while($current<$total); return $all; }
 private function request(): PendingRequest { $url=$this->url();$key=$this->appKey();if($url===''||$key==='')throw new RuntimeException('Configuration Application API Pterodactyl incomplète.');return Http::baseUrl($url)->acceptJson()->withToken($key)->timeout(30)->retry(2,500); }
 public function clientRequest(?string $key=null): PendingRequest { $url=$this->url();$key=$key?:$this->clientKey();if($url===''||$key==='')throw new RuntimeException('Configuration Client API Pterodactyl incomplète.');return Http::baseUrl($url)->acceptJson()->asJson()->withToken($key)->timeout(30); }
     public function getWebsocketCredentials(string $identifier, ?string $key = null): array
    {
        return $this->clientRequest($key)
            ->get("/api/client/servers/{$identifier}/websocket")
            ->throw()
            ->json() ?? [];
    }

    public function sendPowerSignal(string $identifier, string $signal, ?string $key = null): void
    {
        $this->clientRequest($key)
            ->post("/api/client/servers/{$identifier}/power", ['signal' => $signal])
            ->throw();
    }

    public function getResources(string $identifier, ?string $key = null): array
    {
        return $this->clientRequest($key)
            ->get("/api/client/servers/{$identifier}/resources")
            ->throw()
            ->json('attributes') ?? [];
    }

    public function sendCommand(string $identifier, string $command, ?string $key = null): void
    {
        $this->clientRequest($key)
            ->post("/api/client/servers/{$identifier}/command", ['command' => $command])
            ->throw();
    }
    public function restoreServerBackup(string $identifier, string $backup, bool $truncate = true, ?string $key = null): void
{
    $this->clientRequest($key)
        ->post("/api/client/servers/{$identifier}/backups/{$backup}/restore", [
            'truncate' => $truncate,
        ])
        ->throw();
}
 }
