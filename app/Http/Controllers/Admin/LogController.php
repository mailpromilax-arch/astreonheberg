<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

final class LogController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless(Schema::hasTable('admin_logs'), 404);

        $search = trim((string) $request->string('search'));
        $action = trim((string) $request->string('action'));
        $admin = trim((string) $request->string('admin'));
        $dateFrom = trim((string) $request->string('date_from'));
        $dateTo = trim((string) $request->string('date_to'));

        $query = DB::table('admin_logs');

        if ($search !== '') {
            $query->where(function ($builder) use ($search): void {
                foreach ([
                    'action',
                    'description',
                    'ip_address',
                    'user_agent',
                ] as $column) {
                    if (Schema::hasColumn('admin_logs', $column)) {
                        $builder->orWhere($column, 'like', "%{$search}%");
                    }
                }

                if (ctype_digit($search)) {
                    foreach ([
                        'user_id',
                        'target_user_id',
                        'order_id',
                        'service_id',
                        'ticket_id',
                    ] as $column) {
                        if (Schema::hasColumn('admin_logs', $column)) {
                            $builder->orWhere($column, (int) $search);
                        }
                    }
                }
            });
        }

        if (
            $action !== ''
            && Schema::hasColumn('admin_logs', 'action')
        ) {
            $query->where('action', $action);
        }

        if (
            $admin !== ''
            && ctype_digit($admin)
            && Schema::hasColumn('admin_logs', 'user_id')
        ) {
            $query->where('user_id', (int) $admin);
        }

        if (
            $dateFrom !== ''
            && Schema::hasColumn('admin_logs', 'created_at')
        ) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if (
            $dateTo !== ''
            && Schema::hasColumn('admin_logs', 'created_at')
        ) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $columns = ['id'];

        foreach ([
            'action',
            'description',
            'user_id',
            'target_user_id',
            'order_id',
            'service_id',
            'ticket_id',
            'ip_address',
            'user_agent',
            'created_at',
            'updated_at',
        ] as $column) {
            if (Schema::hasColumn('admin_logs', $column)) {
                $columns[] = $column;
            }
        }

        $logs = $query
            ->select(array_values(array_unique($columns)))
            ->latest(
                Schema::hasColumn('admin_logs', 'created_at')
                    ? 'created_at'
                    : 'id',
            )
            ->paginate(30)
            ->withQueryString();

        $adminIds = collect($logs->items())
            ->pluck('user_id')
            ->filter()
            ->unique()
            ->values();

        $admins = (
            $adminIds->isNotEmpty()
            && Schema::hasTable('users')
        )
            ? DB::table('users')
                ->whereIn('id', $adminIds)
                ->get(['id', 'name', 'email'])
                ->keyBy('id')
            : collect();

        $logs->through(function (object $log) use ($admins): array {
            $row = (array) $log;
            $user = isset($row['user_id'])
                ? $admins->get($row['user_id'])
                : null;

            return [
                'id' => $row['id'],
                'action' => $row['action'] ?? 'unknown',
                'description' => $row['description'] ?? null,
                'ip_address' => $row['ip_address'] ?? null,
                'user_agent' => $row['user_agent'] ?? null,
                'target_user_id' => $row['target_user_id'] ?? null,
                'order_id' => $row['order_id'] ?? null,
                'service_id' => $row['service_id'] ?? null,
                'ticket_id' => $row['ticket_id'] ?? null,
                'created_at' => $row['created_at'] ?? null,
                'admin' => $user
                    ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ]
                    : null,
            ];
        });

        $actions = Schema::hasColumn('admin_logs', 'action')
            ? DB::table('admin_logs')
                ->whereNotNull('action')
                ->distinct()
                ->orderBy('action')
                ->pluck('action')
                ->values()
                ->all()
            : [];

        $adminOptions = (
            Schema::hasColumn('admin_logs', 'user_id')
            && Schema::hasTable('users')
        )
            ? DB::table('users')
                ->whereIn(
                    'id',
                    DB::table('admin_logs')
                        ->whereNotNull('user_id')
                        ->distinct()
                        ->pluck('user_id'),
                )
                ->orderBy('name')
                ->get(['id', 'name', 'email'])
                ->map(fn (object $user): array => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ])
                ->all()
            : [];

        return Inertia::render('admin/logs/index', [
            'logs' => $logs,
            'actions' => $actions,
            'admins' => $adminOptions,
            'filters' => [
                'search' => $search,
                'action' => $action,
                'admin' => $admin,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'stats' => [
                'total' => DB::table('admin_logs')->count(),
                'today' => Schema::hasColumn('admin_logs', 'created_at')
                    ? DB::table('admin_logs')
                        ->whereDate('created_at', today())
                        ->count()
                    : 0,
                'security' => Schema::hasColumn('admin_logs', 'action')
                    ? DB::table('admin_logs')
                        ->where(function ($query): void {
                            $query
                                ->where('action', 'like', '%password%')
                                ->orWhere('action', 'like', '%two_factor%')
                                ->orWhere('action', 'like', '%suspend%')
                                ->orWhere('action', 'like', '%login%');
                        })
                        ->count()
                    : 0,
                'unique_admins' => Schema::hasColumn('admin_logs', 'user_id')
                    ? DB::table('admin_logs')
                        ->whereNotNull('user_id')
                        ->distinct('user_id')
                        ->count('user_id')
                    : 0,
            ],
        ]);
    }
}
