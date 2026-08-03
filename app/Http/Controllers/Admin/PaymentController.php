<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

final class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $status = trim((string) $request->string('status'));
        $provider = trim((string) $request->string('provider'));
        $page = max(1, (int) $request->integer('page', 1));
        $perPage = 20;

        $rows = collect();

        if (Schema::hasTable('payments')) {
            $rows = $rows->concat(
                $this->paymentRows($search, $status, $provider),
            );
        }

        if (Schema::hasTable('orders')) {
            $rows = $rows->concat(
                $this->legacyOrderRows($search, $status, $provider),
            );
        }

        $rows = $rows
            ->sortByDesc(fn (array $row): int => strtotime((string) (
                $row['created_at']
                ?? $row['paid_at']
                ?? '1970-01-01'
            )))
            ->values();

        $payments = new LengthAwarePaginator(
            $rows->forPage($page, $perPage)->values(),
            $rows->count(),
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ],
        );

        $providers = $rows
            ->pluck('provider')
            ->filter()
            ->unique()
            ->sort()
            ->values()
            ->all();

        $accepted = $rows->filter(
            fn (array $row): bool => in_array(
                $row['status'],
                ['paid', 'succeeded', 'completed', 'active'],
                true,
            ),
        );

        return Inertia::render('admin/payments/index', [
            'payments' => $payments,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'provider' => $provider,
            ],
            'providers' => $providers,
            'counts' => [
                'total' => $rows->count(),
                'succeeded' => $accepted->count(),
                'pending' => $rows->whereIn('status', [
                    'pending',
                    'processing',
                    'requires_action',
                    'created',
                ])->count(),
                'failed' => $rows->whereIn('status', [
                    'failed',
                    'refused',
                    'cancelled',
                    'canceled',
                ])->count(),
                'refunded' => $rows->whereIn('status', [
                    'refunded',
                    'partially_refunded',
                ])->count(),
            ],
            'amounts' => [
                'month_cents' => $accepted
                    ->filter(fn (array $row): bool => $this->isCurrentMonth(
                        $row['paid_at'] ?? $row['created_at'] ?? null,
                    ))
                    ->sum('amount_cents'),
                'total_cents' => $accepted->sum('amount_cents'),
                'refunded_cents' => $rows->sum('refunded_cents'),
            ],
        ]);
    }

    public function show(string $payment): Response
    {
        [$source, $id] = $this->parseIdentifier($payment);

        if ($source === 'payment') {
            abort_unless(Schema::hasTable('payments'), 404);

            $record = DB::table('payments')->where('id', $id)->first();
            abort_if($record === null, 404);

            $row = (array) $record;
            $customer = $this->findCustomer($row['user_id'] ?? null);
            $order = $this->findOrder($row['order_id'] ?? null);

            return Inertia::render('admin/payments/show', [
                'payment' => $this->sanitize($row),
                'customer' => $customer,
                'order' => $order,
                'source' => 'payment',
            ]);
        }

        abort_unless(Schema::hasTable('orders'), 404);

        $order = DB::table('orders')->where('id', $id)->first();
        abort_if($order === null, 404);

        $row = (array) $order;

        $payment = [
            'id' => 'order-'.$row['id'],
            'reference' => $row['reference']
                ?? $row['number']
                ?? 'Commande #'.$row['id'],
            'provider' => 'stripe/order',
            'status' => $row['status'] ?? 'paid',
            'currency' => strtoupper((string) ($row['currency'] ?? 'EUR')),
            'amount_cents' => (int) (
                $row['total_cents']
                ?? $row['amount_cents']
                ?? 0
            ),
            'paid_at' => $row['paid_at'] ?? $row['created_at'] ?? null,
            'created_at' => $row['created_at'] ?? null,
            'source' => 'legacy_order',
        ];

        return Inertia::render('admin/payments/show', [
            'payment' => $payment,
            'customer' => $this->findCustomer($row['user_id'] ?? null),
            'order' => $order,
            'source' => 'legacy_order',
        ]);
    }

    private function paymentRows(
        string $search,
        string $status,
        string $provider,
    ): Collection {
        $query = DB::table('payments');

        if ($search !== '') {
            $query->where(function ($builder) use ($search): void {
                foreach ([
                    'reference',
                    'transaction_id',
                    'provider_payment_id',
                    'stripe_payment_intent_id',
                    'stripe_session_id',
                ] as $column) {
                    if (Schema::hasColumn('payments', $column)) {
                        $builder->orWhere($column, 'like', "%{$search}%");
                    }
                }

                if (ctype_digit($search)) {
                    $builder->orWhere('id', (int) $search);
                }

                $this->appendUserSearch(
                    $builder,
                    'payments.user_id',
                    $search,
                );
            });
        }

        if ($status !== '' && Schema::hasColumn('payments', 'status')) {
            $query->where('status', $status);
        }

        if ($provider !== '' && Schema::hasColumn('payments', 'provider')) {
            $query->where('provider', $provider);
        }

        $columns = ['id'];

        foreach ([
            'user_id',
            'order_id',
            'reference',
            'transaction_id',
            'provider',
            'status',
            'currency',
            'amount_cents',
            'fee_cents',
            'refunded_cents',
            'paid_at',
            'created_at',
        ] as $column) {
            if (Schema::hasColumn('payments', $column)) {
                $columns[] = $column;
            }
        }

        $records = $query
            ->select(array_unique($columns))
            ->get();

        $users = $this->usersFor($records->pluck('user_id')->filter());

        $orders = $this->ordersFor($records->pluck('order_id')->filter());

        return $records->map(function (object $payment) use ($users, $orders): array {
            $row = (array) $payment;
            $customer = isset($row['user_id'])
                ? $users->get($row['user_id'])
                : null;
            $order = isset($row['order_id'])
                ? $orders->get($row['order_id'])
                : null;

            return [
                'id' => 'payment-'.$row['id'],
                'raw_id' => $row['id'],
                'source' => 'payment',
                'reference' => $row['reference']
                    ?? $row['transaction_id']
                    ?? '#'.$row['id'],
                'provider' => $row['provider'] ?? 'unknown',
                'status' => $row['status'] ?? 'unknown',
                'currency' => strtoupper((string) ($row['currency'] ?? 'EUR')),
                'amount_cents' => (int) ($row['amount_cents'] ?? 0),
                'fee_cents' => (int) ($row['fee_cents'] ?? 0),
                'refunded_cents' => (int) ($row['refunded_cents'] ?? 0),
                'paid_at' => $row['paid_at'] ?? null,
                'created_at' => $row['created_at'] ?? null,
                'customer' => $this->customerArray($customer),
                'order' => $this->orderArray($order),
            ];
        });
    }

    private function legacyOrderRows(
        string $search,
        string $status,
        string $provider,
    ): Collection {
        if ($provider !== '' && ! in_array(
            $provider,
            ['stripe/order', 'stripe', 'order'],
            true,
        )) {
            return collect();
        }

        $query = DB::table('orders');

        $paidStatuses = [
            'paid',
            'completed',
            'active',
            'succeeded',
        ];

        if (Schema::hasColumn('orders', 'status')) {
            $query->whereIn('status', $paidStatuses);
        } elseif (Schema::hasColumn('orders', 'paid_at')) {
            $query->whereNotNull('paid_at');
        }

        if (
            Schema::hasTable('payments')
            && Schema::hasColumn('payments', 'order_id')
        ) {
            $query->whereNotExists(function ($sub): void {
                $sub->selectRaw('1')
                    ->from('payments')
                    ->whereColumn('payments.order_id', 'orders.id');
            });
        }

        if ($search !== '') {
            $query->where(function ($builder) use ($search): void {
                foreach ([
                    'reference',
                    'number',
                    'stripe_session_id',
                    'stripe_payment_intent_id',
                ] as $column) {
                    if (Schema::hasColumn('orders', $column)) {
                        $builder->orWhere($column, 'like', "%{$search}%");
                    }
                }

                if (ctype_digit($search)) {
                    $builder->orWhere('id', (int) $search);
                }

                $this->appendUserSearch(
                    $builder,
                    'orders.user_id',
                    $search,
                );
            });
        }

        if ($status !== '') {
            $query->where('status', $status);
        }

        $columns = ['id'];

        foreach ([
            'user_id',
            'reference',
            'number',
            'status',
            'currency',
            'total_cents',
            'amount_cents',
            'paid_at',
            'created_at',
        ] as $column) {
            if (Schema::hasColumn('orders', $column)) {
                $columns[] = $column;
            }
        }

        $records = $query
            ->select(array_unique($columns))
            ->get();

        $users = $this->usersFor($records->pluck('user_id')->filter());

        return $records->map(function (object $order) use ($users): array {
            $row = (array) $order;
            $customer = isset($row['user_id'])
                ? $users->get($row['user_id'])
                : null;

            return [
                'id' => 'order-'.$row['id'],
                'raw_id' => $row['id'],
                'source' => 'legacy_order',
                'reference' => $row['reference']
                    ?? $row['number']
                    ?? 'Commande #'.$row['id'],
                'provider' => 'stripe/order',
                'status' => $row['status'] ?? 'paid',
                'currency' => strtoupper((string) ($row['currency'] ?? 'EUR')),
                'amount_cents' => (int) (
                    $row['total_cents']
                    ?? $row['amount_cents']
                    ?? 0
                ),
                'fee_cents' => 0,
                'refunded_cents' => 0,
                'paid_at' => $row['paid_at'] ?? $row['created_at'] ?? null,
                'created_at' => $row['created_at'] ?? null,
                'customer' => $this->customerArray($customer),
                'order' => [
                    'id' => $row['id'],
                    'reference' => $row['reference']
                        ?? $row['number']
                        ?? '#'.$row['id'],
                    'status' => $row['status'] ?? null,
                ],
            ];
        });
    }

    private function appendUserSearch(
        mixed $builder,
        string $foreignColumn,
        string $search,
    ): void {
        if (! Schema::hasTable('users')) {
            return;
        }

        $builder->orWhereExists(function ($sub) use (
            $foreignColumn,
            $search,
        ): void {
            $sub->selectRaw('1')
                ->from('users')
                ->whereColumn('users.id', $foreignColumn)
                ->where(function ($userQuery) use ($search): void {
                    $userQuery
                        ->where('users.name', 'like', "%{$search}%")
                        ->orWhere('users.email', 'like', "%{$search}%");
                });
        });
    }

    private function usersFor(Collection $ids): Collection
    {
        if ($ids->isEmpty() || ! Schema::hasTable('users')) {
            return collect();
        }

        return DB::table('users')
            ->whereIn('id', $ids->unique()->values())
            ->get(['id', 'name', 'email'])
            ->keyBy('id');
    }

    private function ordersFor(Collection $ids): Collection
    {
        if ($ids->isEmpty() || ! Schema::hasTable('orders')) {
            return collect();
        }

        $columns = ['id'];

        foreach (['reference', 'number', 'status'] as $column) {
            if (Schema::hasColumn('orders', $column)) {
                $columns[] = $column;
            }
        }

        return DB::table('orders')
            ->whereIn('id', $ids->unique()->values())
            ->get(array_unique($columns))
            ->keyBy('id');
    }

    private function customerArray(?object $customer): ?array
    {
        if ($customer === null) {
            return null;
        }

        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
        ];
    }

    private function orderArray(?object $order): ?array
    {
        if ($order === null) {
            return null;
        }

        return [
            'id' => $order->id,
            'reference' => $order->reference
                ?? $order->number
                ?? '#'.$order->id,
            'status' => $order->status ?? null,
        ];
    }

    private function findCustomer(mixed $userId): ?object
    {
        if (
            $userId === null
            || ! Schema::hasTable('users')
        ) {
            return null;
        }

        return DB::table('users')->where('id', $userId)->first();
    }

    private function findOrder(mixed $orderId): ?object
    {
        if (
            $orderId === null
            || ! Schema::hasTable('orders')
        ) {
            return null;
        }

        return DB::table('orders')->where('id', $orderId)->first();
    }

    private function sanitize(array $row): array
    {
        return collect($row)
            ->reject(
                fn (mixed $value, string $key): bool =>
                    str_contains($key, 'secret')
                    || str_contains($key, 'client_secret'),
            )
            ->all();
    }

    private function parseIdentifier(string $identifier): array
    {
        if (str_starts_with($identifier, 'order-')) {
            return ['order', (int) substr($identifier, 6)];
        }

        if (str_starts_with($identifier, 'payment-')) {
            return ['payment', (int) substr($identifier, 8)];
        }

        return ['payment', (int) $identifier];
    }

    private function isCurrentMonth(mixed $value): bool
    {
        if ($value === null || $value === '') {
            return false;
        }

        $timestamp = strtotime((string) $value);

        return $timestamp !== false
            && date('Y-m', $timestamp) === now()->format('Y-m');
    }
}
