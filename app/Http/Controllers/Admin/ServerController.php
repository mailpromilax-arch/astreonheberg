<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

final class ServerController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless(Schema::hasTable('services'), 404);

        $search = trim((string) $request->string('search'));
        $status = trim((string) $request->string('status'));
        $type = trim((string) $request->string('type'));

        $query = DB::table('services');

        if ($search !== '') {
            $query->where(function ($builder) use ($search): void {
                foreach ([
                    'name',
                    'reference',
                    'identifier',
                    'uuid',
                    'external_id',
                    'pterodactyl_id',
                ] as $column) {
                    if (Schema::hasColumn('services', $column)) {
                        $builder->orWhere($column, 'like', "%{$search}%");
                    }
                }
            });
        }

        if ($status !== '' && Schema::hasColumn('services', 'status')) {
            $query->where('status', $status);
        }

        if ($type !== '') {
            foreach (['type', 'service_type', 'category'] as $column) {
                if (Schema::hasColumn('services', $column)) {
                    $query->where($column, $type);
                    break;
                }
            }
        }

        $columns = ['id'];

        foreach ([
            'user_id',
            'order_id',
            'name',
            'reference',
            'identifier',
            'uuid',
            'external_id',
            'pterodactyl_id',
            'status',
            'type',
            'service_type',
            'category',
            'node',
            'node_name',
            'location',
            'address',
            'port',
            'cpu',
            'memory',
            'disk',
            'players',
            'expires_at',
            'created_at',
            'updated_at',
        ] as $column) {
            if (Schema::hasColumn('services', $column)) {
                $columns[] = $column;
            }
        }

        $services = $query
            ->select(array_values(array_unique($columns)))
            ->latest(
                Schema::hasColumn('services', 'created_at')
                    ? 'created_at'
                    : 'id',
            )
            ->paginate(20)
            ->withQueryString();

        $userNames = [];

        if (
            Schema::hasColumn('services', 'user_id')
            && Schema::hasTable('users')
        ) {
            $ids = collect($services->items())
                ->pluck('user_id')
                ->filter()
                ->unique()
                ->values();

            $userNames = DB::table('users')
                ->whereIn('id', $ids)
                ->get(['id', 'name', 'email'])
                ->keyBy('id')
                ->map(fn (object $user): array => [
                    'name' => $user->name,
                    'email' => $user->email,
                ])
                ->all();
        }

        $services->through(function (object $service) use ($userNames): array {
            $row = (array) $service;
            $userId = $row['user_id'] ?? null;

            return [
                'id' => $row['id'],
                'name' => $row['name']
                    ?? $row['reference']
                    ?? 'Service #'.$row['id'],
                'reference' => $row['reference']
                    ?? $row['identifier']
                    ?? $row['uuid']
                    ?? '#'.$row['id'],
                'status' => $row['status'] ?? 'unknown',
                'type' => $row['type']
                    ?? $row['service_type']
                    ?? $row['category']
                    ?? 'service',
                'node' => $row['node']
                    ?? $row['node_name']
                    ?? null,
                'location' => $row['location'] ?? null,
                'address' => $row['address'] ?? null,
                'port' => $row['port'] ?? null,
                'cpu' => $row['cpu'] ?? null,
                'memory' => $row['memory'] ?? null,
                'disk' => $row['disk'] ?? null,
                'players' => $row['players'] ?? null,
                'expires_at' => $row['expires_at'] ?? null,
                'created_at' => $row['created_at'] ?? null,
                'customer' => $userId !== null
                    ? ($userNames[$userId] ?? null)
                    : null,
            ];
        });

        return Inertia::render('admin/servers/index', [
            'services' => $services,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'type' => $type,
            ],
            'counts' => [
                'total' => DB::table('services')->count(),
                'active' => $this->countByStatuses([
                    'active',
                    'running',
                    'provisioning',
                ]),
                'suspended' => $this->countByStatuses([
                    'suspended',
                    'disabled',
                ]),
                'expired' => $this->countExpired(),
            ],
            'capabilities' => [
                'has_status' => Schema::hasColumn('services', 'status'),
                'has_expiration' => Schema::hasColumn('services', 'expires_at'),
            ],
        ]);
    }

    public function show(int $service): Response
    {
        abort_unless(Schema::hasTable('services'), 404);

        $record = DB::table('services')->where('id', $service)->first();
        abort_if($record === null, 404);

        $row = (array) $record;

        $customer = null;

        if (
            isset($row['user_id'])
            && Schema::hasTable('users')
        ) {
            $customer = DB::table('users')
                ->where('id', $row['user_id'])
                ->first(['id', 'name', 'email']);
        }

        $order = null;

        if (
            isset($row['order_id'])
            && Schema::hasTable('orders')
        ) {
            $order = DB::table('orders')
                ->where('id', $row['order_id'])
                ->first();
        }

        $safe = [];
        foreach ($row as $key => $value) {
            if (in_array($key, [
                'credentials',
                'api_token',
                'password',
                'secret',
            ], true)) {
                continue;
            }

            $safe[$key] = $value;
        }

        return Inertia::render('admin/servers/show', [
            'service' => $safe,
            'customer' => $customer,
            'order' => $order,
            'capabilities' => [
                'has_status' => Schema::hasColumn('services', 'status'),
                'has_cpu' => Schema::hasColumn('services', 'cpu'),
                'has_memory' => Schema::hasColumn('services', 'memory'),
                'has_disk' => Schema::hasColumn('services', 'disk'),
                'has_expires_at' => Schema::hasColumn('services', 'expires_at'),
            ],
        ]);
    }

    public function update(Request $request, int $service): RedirectResponse
    {
        abort_unless(
            Schema::hasTable('services')
                && DB::table('services')->where('id', $service)->exists(),
            404,
        );

        $rules = [];

        foreach ([
            'name' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:50'],
            'cpu' => ['nullable', 'integer', 'min:0'],
            'memory' => ['nullable', 'integer', 'min:0'],
            'disk' => ['nullable', 'integer', 'min:0'],
            'expires_at' => ['nullable', 'date'],
            'node' => ['nullable', 'string', 'max:255'],
            'node_name' => ['nullable', 'string', 'max:255'],
        ] as $column => $rule) {
            if (Schema::hasColumn('services', $column)) {
                $rules[$column] = $rule;
            }
        }

        $validated = $request->validate($rules);

        if (Schema::hasColumn('services', 'updated_at')) {
            $validated['updated_at'] = now();
        }

        if ($validated !== []) {
            DB::table('services')->where('id', $service)->update($validated);
        }

        $this->log(
            $request,
            'service.updated',
            "Service #{$service} modifié",
            $service,
        );

        return back()->with('success', 'Service mis à jour.');
    }

    public function suspend(Request $request, int $service): RedirectResponse
    {
        return $this->setStatus(
            $request,
            $service,
            'suspended',
            'Service suspendu.',
        );
    }

    public function activate(Request $request, int $service): RedirectResponse
    {
        return $this->setStatus(
            $request,
            $service,
            'active',
            'Service réactivé.',
        );
    }

    private function setStatus(
        Request $request,
        int $service,
        string $status,
        string $message,
    ): RedirectResponse {
        abort_unless(
            Schema::hasTable('services')
                && DB::table('services')->where('id', $service)->exists(),
            404,
        );

        if (Schema::hasColumn('services', 'status')) {
            $update = ['status' => $status];

            if (Schema::hasColumn('services', 'updated_at')) {
                $update['updated_at'] = now();
            }

            DB::table('services')
                ->where('id', $service)
                ->update($update);
        }

        $this->log(
            $request,
            'service.'.$status,
            "Service #{$service} : {$status}",
            $service,
        );

        return back()->with('success', $message);
    }

    /**
     * @param array<int, string> $statuses
     */
    private function countByStatuses(array $statuses): int
    {
        if (! Schema::hasColumn('services', 'status')) {
            return 0;
        }

        return DB::table('services')
            ->whereIn('status', $statuses)
            ->count();
    }

    private function countExpired(): int
    {
        if (! Schema::hasColumn('services', 'expires_at')) {
            return 0;
        }

        return DB::table('services')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->count();
    }

    private function log(
        Request $request,
        string $action,
        string $description,
        int $serviceId,
    ): void {
        if (! Schema::hasTable('admin_logs')) {
            return;
        }

        $payload = [];

        foreach ([
            'action' => $action,
            'description' => $description,
            'user_id' => $request->user()?->id,
            'service_id' => $serviceId,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
            'updated_at' => now(),
        ] as $column => $value) {
            if (Schema::hasColumn('admin_logs', $column)) {
                $payload[$column] = $value;
            }
        }

        if ($payload !== []) {
            DB::table('admin_logs')->insert($payload);
        }
    }
}
