<?php

namespace App\Services\Pterodactyl;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class PterodactylClient
{
    public function testConnection(): array
    {
        return $this->listNodes();
    }

    public function listNodes(): array
    {
        return $this->request()
            ->get('/api/application/nodes')
            ->throw()
            ->json();
    }

    public function getNode(int $nodeId): array
    {
        return $this->request()
            ->get("/api/application/nodes/{$nodeId}")
            ->throw()
            ->json();
    }

    public function listAllocations(
        int $nodeId,
        bool $onlyAvailable = false,
    ): array {
        $query = [];

        if ($onlyAvailable) {
            $query['filter']['server_id'] = 0;
        }

        return $this->request()
            ->get(
                "/api/application/nodes/{$nodeId}/allocations",
                $query,
            )
            ->throw()
            ->json();
    }

    public function listNests(): array
    {
        return $this->request()
            ->get('/api/application/nests')
            ->throw()
            ->json();
    }

    public function getNest(
        int $nestId,
        bool $includeEggs = true,
    ): array {
        $query = [];

        if ($includeEggs) {
            $query['include'] = 'eggs';
        }

        return $this->request()
            ->get(
                "/api/application/nests/{$nestId}",
                $query,
            )
            ->throw()
            ->json();
    }

    public function getEgg(
        int $nestId,
        int $eggId,
        bool $includeVariables = true,
    ): array {
        $query = [];

        if ($includeVariables) {
            $query['include'] = 'variables';
        }

        return $this->request()
            ->get(
                "/api/application/nests/{$nestId}/eggs/{$eggId}",
                $query,
            )
            ->throw()
            ->json();
    }

    public function findUserByExternalId(
    string $externalId,
): ?array {
    $response = $this->request()
        ->get(
            '/api/application/users/external/'
            .urlencode($externalId),
        );

    if ($response->status() === 404) {
        return null;
    }

    return $response
        ->throw()
        ->json();
}

public function findUserByEmail(
    string $email,
): ?array {
    $response = $this->request()
        ->get('/api/application/users', [
            'filter' => [
                'email' => $email,
            ],
        ])
        ->throw()
        ->json();

    $user = data_get($response, 'data.0');

    return is_array($user) ? $user : null;
}

    public function createUser(array $data): array
    {
        return $this->request()
            ->post('/api/application/users', $data)
            ->throw()
            ->json();
    }

    public function createServer(array $data): array
    {
        return $this->request()
            ->post('/api/application/servers', $data)
            ->throw()
            ->json();
    }

    public function getServer(int $serverId): array
    {
        return $this->request()
            ->get("/api/application/servers/{$serverId}")
            ->throw()
            ->json();
    }


public function powerAction(
    string $identifier,
    string $apiKey,
    string $signal,
): void {

    $this->clientRequest($apiKey)

        ->post(

            "/api/client/servers/{$identifier}/power",

            [

                'signal' => $signal,

            ],

        )

        ->throw();
}

public function serverResources(
    string $identifier,
    string $apiKey,
): array {

    return $this->clientRequest($apiKey)

        ->get("/api/client/servers/{$identifier}/resources")

        ->throw()

        ->json();

}

public function websocket(
    string $identifier,
    string $apiKey,
): array {

    return $this->clientRequest($apiKey)

        ->get("/api/client/servers/{$identifier}/websocket")

        ->throw()

        ->json();

}

public function backups(
    string $identifier,
    string $apiKey,
): array {

    return $this->clientRequest($apiKey)

        ->get("/api/client/servers/{$identifier}/backups")

        ->throw()

        ->json();

}

public function createBackup(
    string $identifier,
    string $apiKey,
): array {

    return $this->clientRequest($apiKey)

        ->post("/api/client/servers/{$identifier}/backups")

        ->throw()

        ->json();

}


public function listServerBackups(string $identifier): array
{
    return $this->clientRequest()
        ->get("/api/client/servers/{$identifier}/backups")
        ->throw()
        ->json();
}

public function createServerBackup(
    string $identifier,
    ?string $name = null,
): array {
    $payload = [];

    if (filled($name)) {
        $payload['name'] = $name;
    }

    return $this->clientRequest()
        ->post(
            "/api/client/servers/{$identifier}/backups",
            $payload,
        )
        ->throw()
        ->json();
}

public function deleteServerBackup(
    string $identifier,
    string $backupUuid,
): void {
    $this->clientRequest()
        ->delete(
            "/api/client/servers/{$identifier}/backups/{$backupUuid}",
        )
        ->throw();
}

public function restoreServerBackup(
    string $identifier,
    string $backupUuid,
    bool $truncate = true,
): void {
    $this->clientRequest()
        ->post(
            "/api/client/servers/{$identifier}/backups/{$backupUuid}/restore",
            [
                'truncate' => $truncate,
            ],
        )
        ->throw();
}

public function getServerBackupDownload(
    string $identifier,
    string $backupUuid,
): array {
    return $this->clientRequest()
        ->get(
            "/api/client/servers/{$identifier}/backups/{$backupUuid}/download",
        )
        ->throw()
        ->json();
}


public function listServerDatabases(string $identifier): array
{
    return $this->clientRequest()
        ->get("/api/client/servers/{$identifier}/databases")
        ->throw()
        ->json();
}

public function createServerDatabase(
    string $identifier,
    string $database,
    string $remote = '%',
): array {
    return $this->clientRequest()
        ->post(
            "/api/client/servers/{$identifier}/databases",
            [
                'database' => $database,
                'remote' => $remote,
            ],
        )
        ->throw()
        ->json();
}

public function rotateServerDatabasePassword(
    string $identifier,
    string $databaseId,
): array {
    return $this->clientRequest()
        ->post(
            "/api/client/servers/{$identifier}/databases/{$databaseId}/rotate-password",
        )
        ->throw()
        ->json();
}

public function deleteServerDatabase(
    string $identifier,
    string $databaseId,
): void {
    $this->clientRequest()
        ->delete(
            "/api/client/servers/{$identifier}/databases/{$databaseId}",
        )
        ->throw();
}

public function files(
    string $identifier,
    string $apiKey,
    string $directory="/",
): array {

    return $this->clientRequest($apiKey)

        ->get(

            "/api/client/servers/{$identifier}/files/list",

            [

                'directory'=>$directory,

            ],

        )

        ->throw()

        ->json();

}


public function listServerFiles(string $identifier, string $directory = '/'): array
{
    return $this->clientRequest()
        ->get("/api/client/servers/{$identifier}/files/list", ['directory' => $directory])
        ->throw()
        ->json();
}

public function readServerFile(string $identifier, string $file): string
{
    return $this->clientRequest()
        ->get("/api/client/servers/{$identifier}/files/contents", ['file' => $file])
        ->throw()
        ->body();
}

public function writeServerFile(string $identifier, string $file, string $content): void
{
    $this->clientRawRequest()
        ->post("/api/client/servers/{$identifier}/files/write?file=".urlencode($file), $content)
        ->throw();
}

public function createServerFolder(string $identifier, string $root, string $name): void
{
    $this->clientRequest()
        ->post("/api/client/servers/{$identifier}/files/create-folder", [
            'root' => $root,
            'name' => $name,
        ])
        ->throw();
}

public function renameServerFile(string $identifier, string $root, string $from, string $to): void
{
    $this->clientRequest()
        ->put("/api/client/servers/{$identifier}/files/rename", [
            'root' => $root,
            'files' => [['from' => $from, 'to' => $to]],
        ])
        ->throw();
}

public function deleteServerFiles(string $identifier, string $root, array $files): void
{
    $this->clientRequest()
        ->post("/api/client/servers/{$identifier}/files/delete", [
            'root' => $root,
            'files' => array_values($files),
        ])
        ->throw();
}

public function getServerFileDownload(string $identifier, string $file): array
{
    return $this->clientRequest()
        ->get("/api/client/servers/{$identifier}/files/download", ['file' => $file])
        ->throw()
        ->json();
}

public function getServerFileUpload(string $identifier): array
{
    return $this->clientRequest()
        ->get("/api/client/servers/{$identifier}/files/upload")
        ->throw()
        ->json();
}

public function startup(
    string $identifier,
    string $apiKey,
): array {

    return $this->clientRequest($apiKey)

        ->get("/api/client/servers/{$identifier}/startup")

        ->throw()

        ->json();

}


public function getServerStartup(string $identifier): array
{
    return $this->clientRequest()
        ->get("/api/client/servers/{$identifier}/startup")
        ->throw()
        ->json();
}

public function updateServerStartupVariable(
    string $identifier,
    string $key,
    string $value,
): array {
    return $this->clientRequest()
        ->put(
            "/api/client/servers/{$identifier}/startup/variable",
            [
                'key' => $key,
                'value' => $value,
            ],
        )
        ->throw()
        ->json();
}


public function listServerAllocations(string $identifier): array
{
    return $this->clientRequest()
        ->get("/api/client/servers/{$identifier}/network/allocations")
        ->throw()
        ->json();
}

public function createServerAllocation(string $identifier): array
{
    return $this->clientRequest()
        ->post("/api/client/servers/{$identifier}/network/allocations")
        ->throw()
        ->json();
}

public function setServerPrimaryAllocation(
    string $identifier,
    int $allocationId,
): array {
    return $this->clientRequest()
        ->post(
            "/api/client/servers/{$identifier}/network/allocations/{$allocationId}/primary",
        )
        ->throw()
        ->json();
}

public function updateServerAllocationNote(
    string $identifier,
    int $allocationId,
    string $notes,
): array {
    return $this->clientRequest()
        ->post(
            "/api/client/servers/{$identifier}/network/allocations/{$allocationId}",
            [
                'notes' => $notes,
            ],
        )
        ->throw()
        ->json();
}

public function deleteServerAllocation(
    string $identifier,
    int $allocationId,
): void {
    $this->clientRequest()
        ->delete(
            "/api/client/servers/{$identifier}/network/allocations/{$allocationId}",
        )
        ->throw();
}


public function listServerSchedules(string $identifier): array
{
    return $this->clientRequest()
        ->get("/api/client/servers/{$identifier}/schedules")
        ->throw()
        ->json();
}

public function getServerSchedule(
    string $identifier,
    int $scheduleId,
): array {
    return $this->clientRequest()
        ->get(
            "/api/client/servers/{$identifier}/schedules/{$scheduleId}",
        )
        ->throw()
        ->json();
}

public function createServerSchedule(
    string $identifier,
    array $payload,
): array {
    return $this->clientRequest()
        ->post(
            "/api/client/servers/{$identifier}/schedules",
            $payload,
        )
        ->throw()
        ->json();
}

public function updateServerSchedule(
    string $identifier,
    int $scheduleId,
    array $payload,
): array {
    return $this->clientRequest()
        ->post(
            "/api/client/servers/{$identifier}/schedules/{$scheduleId}",
            $payload,
        )
        ->throw()
        ->json();
}

public function executeServerSchedule(
    string $identifier,
    int $scheduleId,
): void {
    $this->clientRequest()
        ->post(
            "/api/client/servers/{$identifier}/schedules/{$scheduleId}/execute",
        )
        ->throw();
}

public function deleteServerSchedule(
    string $identifier,
    int $scheduleId,
): void {
    $this->clientRequest()
        ->delete(
            "/api/client/servers/{$identifier}/schedules/{$scheduleId}",
        )
        ->throw();
}

public function createServerScheduleTask(
    string $identifier,
    int $scheduleId,
    array $payload,
): array {
    return $this->clientRequest()
        ->post(
            "/api/client/servers/{$identifier}/schedules/{$scheduleId}/tasks",
            $payload,
        )
        ->throw()
        ->json();
}

public function updateServerScheduleTask(
    string $identifier,
    int $scheduleId,
    int $taskId,
    array $payload,
): array {
    return $this->clientRequest()
        ->post(
            "/api/client/servers/{$identifier}/schedules/{$scheduleId}/tasks/{$taskId}",
            $payload,
        )
        ->throw()
        ->json();
}

public function deleteServerScheduleTask(
    string $identifier,
    int $scheduleId,
    int $taskId,
): void {
    $this->clientRequest()
        ->delete(
            "/api/client/servers/{$identifier}/schedules/{$scheduleId}/tasks/{$taskId}",
        )
        ->throw();
}

public function power(
    int $serverId,
    string $signal,
): void {

    $this->request()

        ->post(

            "/api/application/servers/{$serverId}/power",

            [

                'signal' => $signal,

            ],

        )

        ->throw();
}

public function details(
    int $serverId,
): array {

    return $this->request()

        ->get(

            "/api/application/servers/{$serverId}",

            [

                'include' => 'allocations',

            ],

        )

        ->throw()

        ->json();
}

public function sendPowerSignal(
    string $identifier,
    string $signal,
): void {
    $this->clientRequest()
        ->post(
            "/api/client/servers/{$identifier}/power",
            ['signal' => $signal],
        )
        ->throw();
}

public function getWebsocketCredentials(
    string $identifier,
): array {
    return $this->clientRequest()
        ->get(
            "/api/client/servers/{$identifier}/websocket",
        )
        ->throw()
        ->json();
}


public function getClientServer(string $identifier): array { return $this->clientRequest()->get("/api/client/servers/{$identifier}")->throw()->json(); }
public function getClientAccount(): array { return $this->clientRequest()->get('/api/client/account')->throw()->json(); }
public function renameClientServer(string $identifier,string $name,string $description=''): void { $this->clientRequest()->post("/api/client/servers/{$identifier}/settings/rename",['name'=>$name,'description'=>$description])->throw(); }
public function reinstallClientServer(string $identifier): void { $this->clientRequest()->post("/api/client/servers/{$identifier}/settings/reinstall")->throw(); }
public function listServerActivity(string $identifier): array { return $this->clientRequest()->get("/api/client/servers/{$identifier}/activity",['include'=>'actor'])->throw()->json(); }
public function listClientPermissions(): array { return $this->clientRequest()->get('/api/client/permissions')->throw()->json(); }
public function listServerUsers(string $identifier): array { return $this->clientRequest()->get("/api/client/servers/{$identifier}/users")->throw()->json(); }
public function createServerUser(string $identifier,string $email,array $permissions): array { return $this->clientRequest()->post("/api/client/servers/{$identifier}/users",['email'=>$email,'permissions'=>array_values($permissions)])->throw()->json(); }
public function updateServerUser(string $identifier,string $uuid,array $permissions): array { return $this->clientRequest()->post("/api/client/servers/{$identifier}/users/{$uuid}",['permissions'=>array_values($permissions)])->throw()->json(); }
public function deleteServerUser(string $identifier,string $uuid): void { $this->clientRequest()->delete("/api/client/servers/{$identifier}/users/{$uuid}")->throw(); }

private function clientRequest(?string $apiKey = null): PendingRequest
{
    $url = rtrim(
        (string) config('services.pterodactyl.url'),
        '/',
    );

    $key = $apiKey ?: (string) config(
        'services.pterodactyl.client_key',
    );

    if ($url === '' || $key === '') {
        throw new RuntimeException(
            'La clé Client API Pterodactyl est absente.',
        );
    }

    return Http::baseUrl($url)
        ->acceptJson()
        ->asJson()
        ->withToken($key)
        ->timeout(30);
}


private function clientRawRequest(): PendingRequest
{
    $url = rtrim((string) config('services.pterodactyl.url'), '/');
    $key = (string) config('services.pterodactyl.client_key');

    if ($url === '' || $key === '') {
        throw new RuntimeException('La clé Client API Pterodactyl est absente.');
    }

    return Http::baseUrl($url)
        ->acceptJson()
        ->withToken($key)
        ->timeout(30);
}

    private function request(): PendingRequest
    {
        $url = rtrim(
            (string) config('services.pterodactyl.url'),
            '/',
        );

        $key = (string) config(
            'services.pterodactyl.application_key',
        );

        if ($url === '' || $key === '') {
            throw new RuntimeException(
                'La configuration Pterodactyl est incomplète.',
            );
        }

        return Http::baseUrl($url)
    ->acceptJson()
    ->asJson()
    ->withToken($key)
    ->timeout(30)
    ->retry(
        times: 2,
        sleepMilliseconds: 500,
        throw: false,
    );
}
}