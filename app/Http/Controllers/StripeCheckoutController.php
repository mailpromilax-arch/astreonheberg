<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Cashier\Cashier;
use Symfony\Component\HttpFoundation\Response;
use App\Services\CreateServicesFromOrder;

class StripeCheckoutController extends Controller
{
    public function create(
        Request $request,
        Order $order,
    ): Response {
        abort_unless(
            $order->user_id === $request->user()->id,
            403,
        );

        abort_unless(
            $order->status === 'pending_payment',
            422,
        );

        $order->load('items');

        $lineItems = $order->items
            ->map(function ($item): array {
                return [
                    'price_data' => [
                        'currency' => 'eur',
                        'unit_amount' => $item->unit_price_cents
                            + $item->setup_fee_cents,
                        'product_data' => [
                            'name' => $item->product_name
                                .' — '
                                .$item->plan_name,
                            'metadata' => [
                                'sku' => $item->sku,
                            ],
                        ],
                    ],
                    'quantity' => $item->quantity,
                ];
            })
            ->values()
            ->all();

        $session = Cashier::stripe()
            ->checkout
            ->sessions
            ->create([
                'mode' => 'payment',
                'customer_email' => $order->billing_email,
                'line_items' => $lineItems,
                'success_url' => route(
                    'stripe.success',
                    $order,
                ).'?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route(
                    'stripe.cancel',
                    $order,
                ),
                'metadata' => [
                    'order_id' => (string) $order->id,
                    'order_reference' => $order->reference,
                ],
            ]);

        $order->update([
            'payment_provider' => 'stripe',
            'payment_reference' => $session->id,
        ]);

        return Inertia::location($session->url);
    }

    public function success(
        Request $request,
        Order $order,
    ): RedirectResponse {
        abort_unless(
            $order->user_id === $request->user()->id,
            403,
        );

        $sessionId = $request
            ->string('session_id')
            ->toString();

        abort_if($sessionId === '', 400);

        $session = Cashier::stripe()
            ->checkout
            ->sessions
            ->retrieve($sessionId);

        abort_unless(
            ($session->metadata->order_id ?? null)
                === (string) $order->id,
            403,
        );

        if ($session->payment_status !== 'paid') {
            return to_route(
                'client.orders.show',
                $order,
            )->with(
                'error',
                'Le paiement Stripe n’est pas confirmé.',
            );
        }

        if ($order->status !== 'paid') {
    $order->update([
        'status' => 'paid',
        'payment_provider' => 'stripe',
        'payment_reference' => $session->id,
        'paid_at' => now(),
    ]);

    activity()
        ->causedBy($request->user())
        ->performedOn($order)
        ->event('order_paid')
        ->withProperties([
            'provider' => 'stripe',
            'session_id' => $session->id,
        ])
        ->log(
            "Paiement Stripe confirmé pour {$order->reference}",
        );
}

app(CreateServicesFromOrder::class)
    ->handle($order);

return to_route(
    'client.orders.show',
    $order,
)->with(
    'success',
    'Le paiement a été confirmé.',
);
    }

    public function cancel(
        Request $request,
        Order $order,
    ): RedirectResponse {
        abort_unless(
            $order->user_id === $request->user()->id,
            403,
        );

        return to_route(
            'client.orders.show',
            $order,
        )->with(
            'error',
            'Le paiement Stripe a été annulé.',
        );
    }
}