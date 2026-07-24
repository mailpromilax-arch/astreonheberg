<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientOrderController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('client/orders/index', [
            'orders' => Order::query()
                ->where('user_id', $request->user()->id)
                ->withCount('items')
                ->latest()
                ->paginate(15),
        ]);
    }

    public function show(
        Request $request,
        Order $order,
    ): Response {
        abort_unless(
            $order->user_id === $request->user()->id,
            403,
        );

        $order->load('items');

        return Inertia::render('client/orders/show', [
            'order' => $order,
        ]);
    }
}