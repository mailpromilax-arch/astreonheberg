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

final class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless(Schema::hasTable('orders'), 404);

        $search = trim((string) $request->string('search'));
        $status = trim((string) $request->string('status'));

        $query = DB::table('orders');

        if ($search !== '') {
            $query->where(function ($builder) use ($search): void {
                foreach (['reference', 'number', 'stripe_session_id', 'stripe_payment_intent_id'] as $column) {
                    if (Schema::hasColumn('orders', $column)) {
                        $builder->orWhere($column, 'like', "%{$search}%");
                    }
                }

                if (ctype_digit($search)) {
                    $builder->orWhere('id', (int) $search);
                }

                if (
                    Schema::hasColumn('orders', 'user_id')
                    && Schema::hasTable('users')
                ) {
                    $builder->orWhereExists(function ($sub) use ($search): void {
                        $sub->selectRaw('1')
                            ->from('users')
                            ->whereColumn('users.id', 'orders.user_id')
                            ->where(function ($userQuery) use ($search): void {
                                $userQuery
                                    ->where('users.name', 'like', "%{$search}%")
                                    ->orWhere('users.email', 'like', "%{$search}%");
                            });
                    });
                }
            });
        }

        if ($status !== '' && Schema::hasColumn('orders', 'status')) {
            $query->where('status', $status);
        }

        $columns = ['id'];

        foreach ([
            'user_id',
            'reference',
            'number',
            'status',
            'currency',
            'subtotal_cents',
            'tax_cents',
            'installation_cents',
            'total_cents',
            'amount_cents',
            'paid_at',
            'created_at',
            'updated_at',
        ] as $column) {
            if (Schema::hasColumn('orders', $column)) {
                $columns[] = $column;
            }
        }

        $orders = $query
            ->select(array_values(array_unique($columns)))
            ->latest(
                Schema::hasColumn('orders', 'created_at')
                    ? 'created_at'
                    : 'id',
            )
            ->paginate(20)
            ->withQueryString();

        $userIds = collect($orders->items())
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

        $orders->through(function (object $order) use ($users): array {
            $row = (array) $order;
            $customer = isset($row['user_id'])
                ? $users->get($row['user_id'])
                : null;

            return [
                'id' => $row['id'],
                'reference' => $row['reference']
                    ?? $row['number']
                    ?? '#'.$row['id'],
                'status' => $row['status'] ?? 'unknown',
                'currency' => strtoupper((string) ($row['currency'] ?? 'EUR')),
                'total_cents' => (int) (
                    $row['total_cents']
                    ?? $row['amount_cents']
                    ?? 0
                ),
                'paid_at' => $row['paid_at'] ?? null,
                'created_at' => $row['created_at'] ?? null,
                'customer' => $customer
                    ? [
                        'id' => $customer->id,
                        'name' => $customer->name,
                        'email' => $customer->email,
                    ]
                    : null,
            ];
        });

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'counts' => [
                'total' => DB::table('orders')->count(),
                'paid' => $this->countStatuses(['paid', 'completed', 'active']),
                'pending' => $this->countStatuses(['pending', 'processing', 'created']),
                'failed' => $this->countStatuses(['failed', 'cancelled', 'canceled', 'refused']),
            ],
            'revenue' => [
                'month_cents' => $this->sumPaid(
                    now()->startOfMonth(),
                ),
                'total_cents' => $this->sumPaid(),
            ],
        ]);
    }

    public function show(int $order): Response
    {
        abort_unless(Schema::hasTable('orders'), 404);

        $record = DB::table('orders')->where('id', $order)->first();
        abort_if($record === null, 404);

        $row = (array) $record;

        $customer = null;
        if (
            isset($row['user_id'])
            && Schema::hasTable('users')
        ) {
            $customer = DB::table('users')
                ->where('id', $row['user_id'])
                ->first();
        }

        $items = [];
        if (
            Schema::hasTable('order_items')
            && Schema::hasColumn('order_items', 'order_id')
        ) {
            $items = DB::table('order_items')
                ->where('order_id', $order)
                ->orderBy('id')
                ->get()
                ->map(fn (object $item): array => (array) $item)
                ->all();
        }

        $services = [];
        if (
            Schema::hasTable('services')
            && Schema::hasColumn('services', 'order_id')
        ) {
            $columns = ['id'];
            foreach (['name', 'reference', 'status', 'expires_at', 'created_at'] as $column) {
                if (Schema::hasColumn('services', $column)) {
                    $columns[] = $column;
                }
            }

            $services = DB::table('services')
                ->select(array_unique($columns))
                ->where('order_id', $order)
                ->get()
                ->map(fn (object $service): array => (array) $service)
                ->all();
        }

        $payments = [];
        if (
            Schema::hasTable('payments')
            && Schema::hasColumn('payments', 'order_id')
        ) {
            $payments = DB::table('payments')
                ->where('order_id', $order)
                ->latest(
                    Schema::hasColumn('payments', 'created_at')
                        ? 'created_at'
                        : 'id',
                )
                ->get()
                ->map(fn (object $payment): array => (array) $payment)
                ->all();
        }

        $safeOrder = [];
        foreach ($row as $key => $value) {
            if (str_contains($key, 'secret')) {
                continue;
            }

            $safeOrder[$key] = $value;
        }

        return Inertia::render('admin/orders/show', [
            'order' => $safeOrder,
            'customer' => $customer,
            'items' => $items,
            'services' => $services,
            'payments' => $payments,
        ]);
    }

    public function update(
        Request $request,
        int $order,
    ): RedirectResponse {
        abort_unless(
            DB::table('orders')->where('id', $order)->exists(),
            404,
        );

        $rules = [];

        if (Schema::hasColumn('orders', 'status')) {
            $rules['status'] = [
                'required',
                'string',
                Rule::in([
                    'created',
                    'pending',
                    'processing',
                    'paid',
                    'completed',
                    'failed',
                    'cancelled',
                    'canceled',
                    'refunded',
                ]),
            ];
        }

        $validated = $request->validate($rules);

        if (Schema::hasColumn('orders', 'updated_at')) {
            $validated['updated_at'] = now();
        }

        if (
            isset($validated['status'])
            && $validated['status'] === 'paid'
            && Schema::hasColumn('orders', 'paid_at')
        ) {
            $validated['paid_at'] = now();
        }

        DB::table('orders')
            ->where('id', $order)
            ->update($validated);

        $this->log(
            $request,
            'order.updated',
            "Commande #{$order} mise à jour",
            $order,
        );

        return back()->with('success', 'Commande mise à jour.');
    }

    private function countStatuses(array $statuses): int
    {
        if (! Schema::hasColumn('orders', 'status')) {
            return 0;
        }

        return DB::table('orders')
            ->whereIn('status', $statuses)
            ->count();
    }

    private function sumPaid(?\DateTimeInterface $from = null): int
    {
        $amountColumn = Schema::hasColumn('orders', 'total_cents')
            ? 'total_cents'
            : (
                Schema::hasColumn('orders', 'amount_cents')
                    ? 'amount_cents'
                    : null
            );

        if ($amountColumn === null) {
            return 0;
        }

        $query = DB::table('orders');

        if (Schema::hasColumn('orders', 'status')) {
            $query->whereIn('status', [
                'paid',
                'completed',
                'active',
            ]);
        } elseif (Schema::hasColumn('orders', 'paid_at')) {
            $query->whereNotNull('paid_at');
        }

        if ($from !== null) {
            $dateColumn = Schema::hasColumn('orders', 'paid_at')
                ? 'paid_at'
                : 'created_at';

            $query->where($dateColumn, '>=', $from);
        }

        return (int) $query->sum($amountColumn);
    }

    private function log(
        Request $request,
        string $action,
        string $description,
        int $orderId,
    ): void {
        if (! Schema::hasTable('admin_logs')) {
            return;
        }

        $payload = [];

        foreach ([
            'action' => $action,
            'description' => $description,
            'user_id' => $request->user()?->id,
            'order_id' => $orderId,
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
