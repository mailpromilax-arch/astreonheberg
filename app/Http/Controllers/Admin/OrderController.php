<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $status = $request->string('status')->toString();

        $orders = Order::query()
            ->with('user:id,name,email')
            ->withCount('items')
            ->when(
                $search !== '',
                fn ($query) => $query->where(function ($query) use ($search): void {
                    $query
                        ->where('reference', 'like', "%{$search}%")
                        ->orWhere('billing_name', 'like', "%{$search}%")
                        ->orWhere('billing_email', 'like', "%{$search}%")
                        ->orWhereHas(
                            'user',
                            fn ($userQuery) => $userQuery
                                ->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%"),
                        );
                }),
            )
            ->when(
                array_key_exists($status, $this->statuses()),
                fn ($query) => $query->where('status', $status),
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'statuses' => $this->statuses(),
            'statistics' => [
                'total' => Order::count(),
                'pending' => Order::where('status', 'pending_payment')->count(),
                'paid' => Order::where('status', 'paid')->count(),
                'active' => Order::where('status', 'active')->count(),
                'revenue_cents' => Order::whereNotNull('paid_at')
                    ->sum('total_cents'),
            ],
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load([
            'user:id,name,email,company_name,status',
            'items.plan:id,name,slug,product_id',
            'items.plan.product:id,name,slug',
        ]);

        return Inertia::render('admin/orders/show', [
            'order' => $order,
            'statuses' => $this->statuses(),
        ]);
    }

    public function update(
        Request $request,
        Order $order,
    ): RedirectResponse {
        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in(array_keys($this->statuses())),
            ],
        ]);

        $oldStatus = $order->status;
        $newStatus = $validated['status'];

        $attributes = [
            'status' => $newStatus,
        ];

        if ($newStatus === 'paid' && $order->paid_at === null) {
            $attributes['paid_at'] = now();
        }

        if ($newStatus !== 'paid' && $oldStatus === 'pending_payment') {
            $attributes['paid_at'] = null;
        }

        $order->update($attributes);

        activity()
            ->causedBy($request->user())
            ->performedOn($order)
            ->event('order_status_updated')
            ->withProperties([
                'reference' => $order->reference,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
            ])
            ->log("Statut de la commande {$order->reference} modifié");

        return back()->with(
            'success',
            'Le statut de la commande a été mis à jour.',
        );
    }

    private function statuses(): array
    {
        return [
            'pending_payment' => 'Paiement en attente',
            'paid' => 'Payée',
            'provisioning' => 'Provisionnement',
            'active' => 'Active',
            'suspended' => 'Suspendue',
            'cancelled' => 'Annulée',
            'completed' => 'Terminée',
            'failed' => 'Échec',
        ];
    }
}