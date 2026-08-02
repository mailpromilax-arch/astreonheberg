<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientDashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $orders = $user->orders();

        $services = Service::query()
            ->where('user_id', $user->id);

        return Inertia::render('client/dashboard', [
            'statistics' => [
                'orders' => (clone $orders)->count(),

                'pending_orders' => (clone $orders)
                    ->where('status', 'pending_payment')
                    ->count(),

                'paid_orders' => (clone $orders)
                    ->whereNotNull('paid_at')
                    ->count(),

                'paid_cents' => (int) (clone $orders)
                    ->whereNotNull('paid_at')
                    ->sum('total_cents'),

                'services' => (clone $services)->count(),

                'active_services' => (clone $services)
                    ->where('status', 'active')
                    ->count(),

                'provisioning_services' => (clone $services)
                    ->where('status', 'provisioning')
                    ->count(),

                'failed_services' => (clone $services)
                    ->where('status', 'failed')
                    ->count(),

                'expiring_services' => (clone $services)
                    ->whereNotNull('expires_at')
                    ->whereBetween('expires_at', [
                        now(),
                        now()->addDays(14),
                    ])
                    ->count(),
            ],

            'latestOrders' => Order::query()
                ->where('user_id', $user->id)
                ->withCount('items')
                ->latest()
                ->limit(5)
                ->get([
                    'id',
                    'reference',
                    'status',
                    'total_cents',
                    'paid_at',
                    'created_at',
                ]),

            'latestServices' => Service::query()
                ->where('user_id', $user->id)
                ->latest()
                ->limit(5)
                ->get([
                    'id',
                    'reference',
                    'name',
                    'status',
                    'provider',
                    'external_url',
                    'expires_at',
                    'configuration',
                    'created_at',
                ]),
        ]);
    }
}