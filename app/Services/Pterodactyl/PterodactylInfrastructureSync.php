<?php

declare(strict_types=1);

namespace App\Services\Pterodactyl;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

final class PterodactylInfrastructureSync
{
    public function sync(): array
    {
        $locations = $this->fetchAll('/api/application/locations');
        $nodes = $this->fetchAll('/api/application/nodes');
        $servers = $this->fetchAll('/api/application/servers');

        $locationMap = $this->syncLocations($locations);
        $nodeMap = $this->syncNodes($nodes, $locationMap);
        $serverStats = $this->syncServers($servers, $nodeMap);

        $this->refreshNodeCounts();

        return [
            'locations' => count($locations),
            'nodes' => count($nodes),
            'servers' => count($servers),
            'linked_users' => $serverStats['linked_users'],
            'unlinked_users' => $serverStats['unlinked_users'],
        ];
    }

    private function syncLocations(array $records): array
    {
        $map = [];

        foreach ($records as $record) {
            $attributes = $record['attributes'] ?? $record;
            $pterodactylId = (int) ($attributes['id'] ?? 0);

            if ($pterodactylId < 1) {
                continue;
            }

            $id = DB::table('locations')->updateOrInsert(
                ['pterodactyl_id' => $pterodactylId],
                [
                    'short' => $attributes['short'] ?? null,
                    'name' => $attributes['long']
                        ?? $attributes['short']
                        ?? 'Location '.$pterodactylId,
                    'description' => $attributes['long'] ?? null,
                    'updated_at' => now(),
                    'created_at' => DB::raw('COALESCE(created_at, CURRENT_TIMESTAMP)'),
                ],
            );

            $localId = DB::table('locations')
                ->where('pterodactyl_id', $pterodactylId)
                ->value('id');

            $map[$pterodactylId] = (int) $localId;
        }

        return $map;
    }

    private function syncNodes(array $records, array $locationMap): array
    {
        $map = [];

        foreach ($records as $record) {
            $attributes = $record['attributes'] ?? $record;
            $pterodactylId = (int) ($attributes['id'] ?? 0);

            if ($pterodactylId < 1) {
                continue;
            }

            $pterodactylLocation = (int) (
                $attributes['location_id']
                ?? data_get($attributes, 'relationships.location.attributes.id')
                ?? 0
            );

            DB::table('nodes')->updateOrInsert(
                ['pterodactyl_id' => $pterodactylId],
                [
                    'location_id' => $locationMap[$pterodactylLocation] ?? null,
                    'name' => $attributes['name'] ?? 'Node '.$pterodactylId,
                    'fqdn' => $attributes['fqdn'] ?? null,
                    'scheme' => $attributes['scheme'] ?? 'https',
                    'status' => 'online',
                    'memory_total' => (int) ($attributes['memory'] ?? 0),
                    'disk_total' => (int) ($attributes['disk'] ?? 0),
                    'memory_overallocate' => (int) ($attributes['memory_overallocate'] ?? 0),
                    'disk_overallocate' => (int) ($attributes['disk_overallocate'] ?? 0),
                    'last_synced_at' => now(),
                    'raw' => json_encode($attributes, JSON_THROW_ON_ERROR),
                    'updated_at' => now(),
                    'created_at' => DB::raw('COALESCE(created_at, CURRENT_TIMESTAMP)'),
                ],
            );

            $localId = DB::table('nodes')
                ->where('pterodactyl_id', $pterodactylId)
                ->value('id');

            $map[$pterodactylId] = (int) $localId;
        }

        return $map;
    }

    private function syncServers(array $records, array $nodeMap): array
    {
        $linked = 0;
        $unlinked = 0;
        $pteroUsers = [];

        foreach ($records as $record) {
            $attributes = $record['attributes'] ?? $record;
            $pterodactylId = (int) ($attributes['id'] ?? 0);

            if ($pterodactylId < 1) {
                continue;
            }

            $pterodactylUserId = (int) ($attributes['user'] ?? 0);
            $localUserId = $this->resolveLocalUser(
                $attributes,
                $pterodactylUserId,
                $pteroUsers,
            );

            $localUserId ? $linked++ : $unlinked++;

            $limits = $attributes['limits'] ?? [];
            $allocation = $attributes['allocation'] ?? null;

            DB::table('servers')->updateOrInsert(
                ['pterodactyl_id' => $pterodactylId],
                [
                    'identifier' => $attributes['identifier'] ?? null,
                    'uuid' => $attributes['uuid'] ?? null,
                    'external_id' => $attributes['external_id'] ?? null,
                    'user_id' => $localUserId,
                    'pterodactyl_user_id' => $pterodactylUserId ?: null,
                    'node_id' => $nodeMap[(int) ($attributes['node'] ?? 0)] ?? null,
                    'name' => $attributes['name'] ?? 'Serveur '.$pterodactylId,
                    'status' => ! empty($attributes['suspended'])
                        ? 'suspended'
                        : 'active',
                    'cpu' => (int) ($limits['cpu'] ?? 0),
                    'memory' => (int) ($limits['memory'] ?? 0),
                    'disk' => (int) ($limits['disk'] ?? 0),
                    'allocation' => is_array($allocation)
                        ? ($allocation['ip_alias'] ?? $allocation['ip'] ?? null)
                        : null,
                    'suspended' => (bool) ($attributes['suspended'] ?? false),
                    'last_synced_at' => now(),
                    'raw' => json_encode($attributes, JSON_THROW_ON_ERROR),
                    'updated_at' => now(),
                    'created_at' => DB::raw('COALESCE(created_at, CURRENT_TIMESTAMP)'),
                ],
            );
        }

        return [
            'linked_users' => $linked,
            'unlinked_users' => $unlinked,
        ];
    }

    private function resolveLocalUser(
        array $server,
        int $pterodactylUserId,
        array &$cache,
    ): ?int {
        $externalId = trim((string) ($server['external_id'] ?? ''));

        if ($externalId !== '') {
            if (ctype_digit($externalId)) {
                $exists = DB::table('users')->where('id', (int) $externalId)->exists();
                if ($exists) {
                    return (int) $externalId;
                }
            }

            foreach (['external_id', 'pterodactyl_id'] as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $id = DB::table('users')->where($column, $externalId)->value('id');
                    if ($id) {
                        return (int) $id;
                    }
                }
            }
        }

        if ($pterodactylUserId < 1) {
            return null;
        }

        if (! array_key_exists($pterodactylUserId, $cache)) {
            $response = $this->request()
                ->get("/api/application/users/{$pterodactylUserId}");

            $cache[$pterodactylUserId] = $response->successful()
                ? ($response->json('attributes') ?? [])
                : [];
        }

        $email = trim((string) ($cache[$pterodactylUserId]['email'] ?? ''));

        if ($email === '') {
            return null;
        }

        $id = DB::table('users')
            ->whereRaw('LOWER(email) = ?', [mb_strtolower($email)])
            ->value('id');

        return $id ? (int) $id : null;
    }

    private function refreshNodeCounts(): void
    {
        DB::table('nodes')->get(['id'])->each(function (object $node): void {
            DB::table('nodes')
                ->where('id', $node->id)
                ->update([
                    'servers_count' => DB::table('servers')
                        ->where('node_id', $node->id)
                        ->count(),
                    'updated_at' => now(),
                ]);
        });
    }

    private function fetchAll(string $endpoint): array
    {
        $page = 1;
        $all = [];

        do {
            $response = $this->request()->get($endpoint, [
                'page' => $page,
                'per_page' => 100,
                'include' => 'location',
            ]);

            if (! $response->successful()) {
                throw new RuntimeException(
                    "Pterodactyl {$endpoint} : HTTP {$response->status()} — {$response->body()}",
                );
            }

            $json = $response->json();
            $all = array_merge($all, $json['data'] ?? []);

            $current = (int) data_get($json, 'meta.pagination.current_page', $page);
            $total = (int) data_get($json, 'meta.pagination.total_pages', $current);
            $page++;
        } while ($current < $total);

        return $all;
    }

    private function request(): PendingRequest
    {
        $url = rtrim((string) (
            config('services.pterodactyl.url')
            ?? config('pterodactyl.url')
            ?? env('PTERODACTYL_URL')
            ?? env('PTERODACTYL_PANEL_URL')
            ?? env('PANEL_URL')
        ), '/');

        $key = (string) (
            config('services.pterodactyl.application_key')
            ?? config('services.pterodactyl.api_key')
            ?? config('pterodactyl.application_key')
            ?? env('PTERODACTYL_APPLICATION_API_KEY')
            ?? env('PTERODACTYL_APPLICATION_KEY')
            ?? env('PTERODACTYL_API_KEY')
        );

        if ($url === '' || $key === '') {
            throw new RuntimeException(
                'URL ou clé Application API Pterodactyl introuvable dans la configuration.',
            );
        }

        return Http::baseUrl($url)
            ->acceptJson()
            ->withToken($key)
            ->timeout(30)
            ->retry(2, 500);
    }
}
