<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientDashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('client/dashboard', [
            'statistics' => [
                'orders' => $user->orders()->count(),
                'pending' => $user->orders()
                    ->where('status', 'pending_payment')
                    ->count(),
                'active' => $user->orders()
                    ->where('status', 'active')
                    ->count(),
                'paid_cents' => $user->orders()
                    ->whereNotNull('paid_at')
                    ->sum('total_cents'),
            ],
            'latestOrders' => Order::query()
                ->where('user_id', $user->id)
                ->withCount('items')
                ->latest()
                ->limit(5)
                ->get(),
        ]);
    }
}