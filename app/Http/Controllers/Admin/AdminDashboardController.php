<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        $count = fn (string $table): int =>
            Schema::hasTable($table) ? DB::table($table)->count() : 0;

        $customers = 0;
        if (Schema::hasTable('users')) {
            $users = DB::table('users');
            if (Schema::hasColumn('users', 'role')) {
                $users->where('role', 'client');
            }
            $customers = $users->count();
        }

        $activeServices = 0;
        if (Schema::hasTable('services')) {
            $services = DB::table('services');
            if (Schema::hasColumn('services', 'status')) {
                $services->whereIn('status', ['active', 'running', 'provisioning']);
            }
            if (Schema::hasColumn('services', 'expires_at')) {
                $services->where(function ($query): void {
                    $query->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                });
            }
            $activeServices = $services->count();
        }

        $openTickets = 0;
        if (Schema::hasTable('tickets')) {
            $tickets = DB::table('tickets');
            if (Schema::hasColumn('tickets', 'status')) {
                $tickets->whereNotIn('status', ['closed', 'resolved']);
            }
            $openTickets = $tickets->count();
        }

        $revenueMonth = 0;
        $revenueTotal = 0;
        if (
            Schema::hasTable('orders')
            && Schema::hasColumn('orders', 'total_cents')
        ) {
            $paid = DB::table('orders');

            if (Schema::hasColumn('orders', 'status')) {
                $paid->whereIn('status', ['paid', 'completed', 'active', 'processing']);
            } elseif (Schema::hasColumn('orders', 'paid_at')) {
                $paid->whereNotNull('paid_at');
            }

            $revenueTotal = (int) (clone $paid)->sum('total_cents');

            $dateColumn = Schema::hasColumn('orders', 'paid_at')
                ? 'paid_at'
                : 'created_at';

            $revenueMonth = (int) (clone $paid)
                ->where($dateColumn, '>=', now()->startOfMonth())
                ->sum('total_cents');
        }

        $latestUsers = [];
        if (Schema::hasTable('users')) {
            $columns = ['id', 'name', 'email', 'created_at'];

            if (Schema::hasColumn('users', 'role')) {
                $columns[] = 'role';
            }

            $latestUsers = DB::table('users')
                ->select($columns)
                ->latest('created_at')
                ->limit(6)
                ->get()
                ->map(fn ($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'client',
                    'created_at' => $user->created_at,
                ])
                ->all();
        }

        $latestOrders = [];
        if (Schema::hasTable('orders')) {
            $columns = ['id', 'created_at'];

            foreach (['reference', 'status', 'total_cents'] as $column) {
                if (Schema::hasColumn('orders', $column)) {
                    $columns[] = $column;
                }
            }

            $latestOrders = DB::table('orders')
                ->select($columns)
                ->latest('created_at')
                ->limit(6)
                ->get()
                ->map(fn ($order) => [
                    'id' => $order->id,
                    'reference' => $order->reference ?? '#'.$order->id,
                    'status' => $order->status ?? 'unknown',
                    'total_cents' => (int) ($order->total_cents ?? 0),
                    'created_at' => $order->created_at,
                ])
                ->all();
        }

        return Inertia::render('admin/dashboard', [
            'statistics' => [
                'customers' => $customers,
                'active_services' => $activeServices,
                'open_tickets' => $openTickets,
                'orders' => $count('orders'),
                'revenue_month_cents' => $revenueMonth,
                'revenue_total_cents' => $revenueTotal,
            ],
            'latestUsers' => $latestUsers,
            'latestOrders' => $latestOrders,
        ]);
    }
}
