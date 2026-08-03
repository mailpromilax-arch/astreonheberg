<?php

declare(strict_types=1);

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\WalletTopUp;
use App\Services\Payments\PayPalClient;
use App\Services\Wallet\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Cashier\Cashier;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Throwable;

final class WalletController extends Controller
{
    public function index(
        Request $request,
        WalletService $wallets,
        PayPalClient $paypal,
    ): Response {
        $wallet = $wallets->walletFor($request->user());

        return Inertia::render('client/wallet/index', [
            'wallet' => [
                'balance_cents' => $wallet->balance_cents,
                'currency' => $wallet->currency,
            ],
            'transactions' => $wallet->transactions()
                ->latest()
                ->limit(50)
                ->get()
                ->map(fn ($transaction): array => [
                    'id' => $transaction->id,
                    'direction' => $transaction->direction,
                    'type' => $transaction->type,
                    'source' => $transaction->source,
                    'amount_cents' => $transaction->amount_cents,
                    'balance_after_cents' => $transaction->balance_after_cents,
                    'description' => $transaction->description,
                    'created_at' => $transaction->created_at?->toIso8601String(),
                ]),
            'stripeKey' => config('cashier.key') ?: env('STRIPE_KEY'),
            'paypalConfigured' => $paypal->configured(),
            'limits' => [
                'minimum_cents' => 100,
                'maximum_cents' => 100000,
            ],
        ]);
    }

    public function stripeIntent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount_cents' => ['required', 'integer', 'min:100', 'max:100000'],
        ]);

        $topUp = WalletTopUp::query()->create([
            'user_id' => $request->user()->id,
            'provider' => 'stripe',
            'status' => 'pending',
            'amount_cents' => $validated['amount_cents'],
            'currency' => 'EUR',
        ]);

        $intent = Cashier::stripe()->paymentIntents->create([
            'amount' => $topUp->amount_cents,
            'currency' => 'eur',
            'automatic_payment_methods' => ['enabled' => true],
            'receipt_email' => $request->user()->email,
            'description' => 'Rechargement portefeuille Astreon',
            'metadata' => [
                'purpose' => 'wallet_topup',
                'wallet_topup_id' => (string) $topUp->id,
                'user_id' => (string) $request->user()->id,
            ],
        ]);

        $topUp->forceFill([
            'provider_reference' => $intent->id,
        ])->save();

        return response()->json([
            'topup_id' => $topUp->id,
            'payment_intent_id' => $intent->id,
            'client_secret' => $intent->client_secret,
        ]);
    }

    public function stripeConfirm(
        Request $request,
        WalletService $wallets,
    ): JsonResponse {
        $validated = $request->validate([
            'payment_intent_id' => ['required', 'string', 'max:190'],
        ]);

        $topUp = WalletTopUp::query()
            ->where('user_id', $request->user()->id)
            ->where('provider', 'stripe')
            ->where('provider_reference', $validated['payment_intent_id'])
            ->firstOrFail();

        if ($topUp->status === 'completed') {
            return response()->json([
                'ok' => true,
                'redirect' => route('client.wallet.index'),
            ]);
        }

        $intent = Cashier::stripe()->paymentIntents->retrieve(
            $validated['payment_intent_id'],
        );

        abort_unless(
            ($intent->metadata->purpose ?? null) === 'wallet_topup'
            && ($intent->metadata->user_id ?? null)
                === (string) $request->user()->id,
            403,
        );

        if (
            $intent->status !== 'succeeded'
            || (int) $intent->amount_received !== $topUp->amount_cents
        ) {
            return response()->json([
                'message' => 'Le paiement Stripe n’est pas confirmé.',
            ], 422);
        }

        $wallets->credit(
            $request->user(),
            $topUp->amount_cents,
            'topup',
            'stripe',
            'stripe:'.$intent->id,
            'Rechargement par carte bancaire',
            null,
            ['payment_intent' => $intent->id],
        );

        $topUp->forceFill([
            'status' => 'completed',
            'completed_at' => now(),
        ])->save();

        return response()->json([
            'ok' => true,
            'redirect' => route('client.wallet.index'),
        ]);
    }

    public function paypalCreate(
        Request $request,
        PayPalClient $paypal,
    ): SymfonyResponse {
        $validated = $request->validate([
            'amount_cents' => ['required', 'integer', 'min:100', 'max:100000'],
        ]);

        abort_unless($paypal->configured(), 503, 'PayPal non configuré.');

        $topUp = WalletTopUp::query()->create([
            'user_id' => $request->user()->id,
            'provider' => 'paypal',
            'status' => 'pending',
            'amount_cents' => $validated['amount_cents'],
            'currency' => 'EUR',
        ]);

        $reference = 'wallet-topup-'.$topUp->id.'-'.Str::lower(Str::random(8));

        $order = $paypal->createOrder(
            $topUp->amount_cents,
            $reference,
            route('client.wallet.paypal.return', ['topup' => $topUp->id]),
            route('client.wallet.paypal.cancel', ['topup' => $topUp->id]),
        );

        $topUp->forceFill([
            'provider_reference' => $order['id'],
            'approval_url' => $order['approval_url'],
            'metadata' => ['reference' => $reference],
        ])->save();

        return Inertia::location($order['approval_url']);
    }

    public function paypalReturn(
        Request $request,
        WalletTopUp $topup,
        PayPalClient $paypal,
        WalletService $wallets,
    ): RedirectResponse {
        abort_unless($topup->user_id === $request->user()->id, 403);
        abort_unless($topup->provider === 'paypal', 404);

        if ($topup->status === 'completed') {
            return to_route('client.wallet.index')
                ->with('success', 'Le portefeuille a déjà été crédité.');
        }

        try {
            $capture = $paypal->captureOrder(
                (string) $topup->provider_reference,
            );
        } catch (Throwable $exception) {
            report($exception);

            return to_route('client.wallet.index')->with(
                'error',
                'PayPal n’a pas pu confirmer le paiement.',
            );
        }

        $captureData = data_get(
            $capture,
            'purchase_units.0.payments.captures.0',
        );

        $status = data_get($captureData, 'status');
        $captureId = data_get($captureData, 'id');
        $currency = data_get($captureData, 'amount.currency_code');
        $amount = data_get($captureData, 'amount.value');

        $capturedCents = (int) round(((float) $amount) * 100);

        abort_unless(
            $status === 'COMPLETED'
            && is_string($captureId)
            && $currency === 'EUR'
            && $capturedCents === $topup->amount_cents,
            422,
            'La capture PayPal ne correspond pas au rechargement.',
        );

        $wallets->credit(
            $request->user(),
            $topup->amount_cents,
            'topup',
            'paypal',
            'paypal:'.$captureId,
            'Rechargement par PayPal',
            null,
            ['paypal_order_id' => $topup->provider_reference],
        );

        $topup->forceFill([
            'status' => 'completed',
            'provider_capture_reference' => $captureId,
            'completed_at' => now(),
        ])->save();

        return to_route('client.wallet.index')
            ->with('success', 'Votre portefeuille a été crédité via PayPal.');
    }

    public function paypalCancel(
        Request $request,
        WalletTopUp $topup,
    ): RedirectResponse {
        abort_unless($topup->user_id === $request->user()->id, 403);

        if ($topup->status === 'pending') {
            $topup->forceFill(['status' => 'cancelled'])->save();
        }

        return to_route('client.wallet.index')
            ->with('error', 'Le paiement PayPal a été annulé.');
    }
}
