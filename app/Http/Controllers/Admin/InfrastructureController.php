<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

final class InfrastructureController extends Controller
{
    public function index(Request $request): Response
    {
        $nodes = $this->nodes();
        $locations = $this->locations();
        $servers = $this->servers();

        return Inertia::render('admin/infrastructure/index', [
            'nodes' => $nodes,
            'locations' => $locations,
            'servers' => $servers,
            'stats' => [
                'nodes' => count($nodes),
                'online_nodes' => collect($nodes)
                    ->whereIn('status', ['online', 'active', 'healthy'])
                    ->count(),
                'locations' => count($locations),
                'servers' => count($servers),
                'active_servers' => collect($servers)
                    ->whereIn('status', ['active', 'running', 'online'])
                    ->count(),
                'cpu_total' => collect($nodes)->sum('cpu_total'),
                'memory_total' => collect($nodes)->sum('memory_total'),
                'disk_total' => collect($nodes)->sum('disk_total'),
            ],
        ]);
    }

    private function nodes(): array
    {
        if (! Schema::hasTable('nodes')) {
            return [];
        }

        return DB::table('nodes')
            ->orderBy('id')
            ->get()
            ->map(function (object $node): array {
                $row = (array) $node;

                return [
                    'id' => $row['id'],
                    'name' => $row['name']
                        ?? $row['hostname']
                        ?? 'Node #'.$row['id'],
                    'hostname' => $row['hostname']
                        ?? $row['fqdn']
                        ?? $row['address']
                        ?? null,
                    'status' => $row['status'] ?? 'unknown',
                    'location_id' => $row['location_id'] ?? null,
                    'cpu_total' => (int) (
                        $row['cpu_total']
                        ?? $row['cpu']
                        ?? 0
                    ),
                    'memory_total' => (int) (
                        $row['memory_total']
                        ?? $row['memory']
                        ?? 0
                    ),
                    'disk_total' => (int) (
                        $row['disk_total']
                        ?? $row['disk']
                        ?? 0
                    ),
                    'servers_count' => (int) (
                        $row['servers_count']
                        ?? 0
                    ),
                    'created_at' => $row['created_at'] ?? null,
                ];
            })
            ->all();
    }

    private function locations(): array
    {
        if (! Schema::hasTable('locations')) {
            return [];
        }

        return DB::table('locations')
            ->orderBy('id')
            ->get()
            ->map(function (object $location): array {
                $row = (array) $location;

                return [
                    'id' => $row['id'],
                    'name' => $row['name']
                        ?? $row['short']
                        ?? 'Location #'.$row['id'],
                    'country' => $row['country']
                        ?? $row['country_code']
                        ?? null,
                    'city' => $row['city'] ?? null,
                    'short' => $row['short'] ?? null,
                    'description' => $row['description'] ?? null,
                    'created_at' => $row['created_at'] ?? null,
                ];
            })
            ->all();
    }

    private function servers(): array
    {
        $table = Schema::hasTable('servers')
            ? 'servers'
            : (Schema::hasTable('services') ? 'services' : null);

        if ($table === null) {
            return [];
        }

        $columns = ['id'];

        foreach ([
            'name',
            'reference',
            'identifier',
            'status',
            'node_id',
            'node',
            'node_name',
            'location_id',
            'cpu',
            'memory',
            'disk',
            'user_id',
            'created_at',
        ] as $column) {
            if (Schema::hasColumn($table, $column)) {
                $columns[] = $column;
            }
        }

        $records = DB::table($table)
            ->select(array_unique($columns))
            ->latest(
                Schema::hasColumn($table, 'created_at')
                    ? 'created_at'
                    : 'id',
            )
            ->limit(100)
            ->get();

        $userIds = $records
            ->pluck('user_id')
            ->filter()
            ->unique()
            ->values();

        $users = (
            $userIds->isNotEmpty()
            && Schema::hasTable('users')
        )
            ? DB::table('users')
                ->whereIn('id', $userIds)
                ->get(['id', 'name', 'email'])
                ->keyBy('id')
            : collect();

        return $records
            ->map(function (object $server) use ($users): array {
                $row = (array) $server;
                $user = isset($row['user_id'])
                    ? $users->get($row['user_id'])
                    : null;

                return [
                    'id' => $row['id'],
                    'name' => $row['name']
                        ?? $row['reference']
                        ?? $row['identifier']
                        ?? 'Serveur #'.$row['id'],
                    'status' => $row['status'] ?? 'unknown',
                    'node' => $row['node']
                        ?? $row['node_name']
                        ?? $row['node_id']
                        ?? null,
                    'location_id' => $row['location_id'] ?? null,
                    'cpu' => $row['cpu'] ?? null,
                    'memory' => $row['memory'] ?? null,
                    'disk' => $row['disk'] ?? null,
                    'customer' => $user
                        ? [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                        ]
                        : null,
                    'created_at' => $row['created_at'] ?? null,
                ];
            })
            ->all();
    }
}
