<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Panel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

final class InfrastructureController extends Controller
{
    public function index(Request $request): Response
    {
        $nodes = $this->rows('nodes');
        $locations = $this->rows('locations');
        $servers = $this->servers();

        return Inertia::render('admin/infrastructure/index', [
            'nodes' => $nodes,
            'locations' => $locations,
            'servers' => $servers,
            'panels' => Panel::query()
                ->orderBy('name')
                ->get(['id', 'name', 'url', 'is_active'])
                ->toArray(),
            'pterodactyl_panel_url' => rtrim((string) (Panel::query()->where('is_active', true)->value('url') ?: config('services.pterodactyl.url')), '/'),
            'stats' => [
                'nodes' => count($nodes),
                'online_nodes' => collect($nodes)->whereIn('status', ['online', 'active', 'healthy'])->count(),
                'locations' => count($locations),
                'servers' => count($servers),
                'active_servers' => collect($servers)->whereIn('status', ['active', 'running', 'online'])->count(),
                'cpu_total' => collect($nodes)->sum('cpu_total'),
                'memory_total' => collect($nodes)->sum('memory_total'),
                'disk_total' => collect($nodes)->sum('disk_total'),
            ],
        ]);
    }

    private function servers(): array
    {
        if (! Schema::hasTable('servers')) {
            return [];
        }

        return DB::table('servers')
            ->leftJoin('services', function ($join) {
                $join->on('services.external_id', '=', DB::raw('CAST(servers.pterodactyl_id AS CHAR)'))
                    ->where('services.provider', '=', 'pterodactyl');
            })
            ->leftJoin('users', 'users.id', '=', 'services.user_id')
            ->select(
                'servers.*',
                'users.name as client_name',
                'users.email as client_email',
                'services.reference as service_reference',
            )
            ->orderBy('servers.id')
            ->limit(500)
            ->get()
            ->map(fn (object $x) => (array) $x)
            ->all();
    }

    private function rows(string $table): array
    {
        if (! Schema::hasTable($table)) {
            return [];
        }

        return DB::table($table)
            ->orderBy('id')
            ->limit(500)
            ->get()
            ->map(fn (object $x) => (array) $x)
            ->all();
    }
}