<?php

declare(strict_types=1);

namespace App\Http\Controllers\Client\Account;

use App\Services\Mail\AstreonMailer;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Stripe\StripeClient;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

final class PaymentMethodController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $user = $request->user();
        $billingError = null;

        try {
            $this->finalizeCheckoutSession($request);

            $defaultId = $user->hasStripeId()
                ? $user->defaultPaymentMethod()?->id
                : null;

            $methods = $user->hasStripeId()
                ? collect($user->paymentMethods('card'))
                    ->map(fn ($method): array => [
                        'id' => $method->id,
                        'brand' => $method->card?->brand ?? 'card',
                        'last4' => $method->card?->last4 ?? '----',
                        'exp_month' => $method->card?->exp_month,
                        'exp_year' => $method->card?->exp_year,
                        'holder_name' => $method->billing_details?->name,
                        'is_default' => $method->id === $defaultId,
                    ])
                    ->values()
                    ->all()
                : [];
        } catch (Throwable $exception) {
            report($exception);

            $methods = [];
            $billingError = 'Impossible de charger les moyens de paiement Stripe.';
        }

        return Inertia::render('client/account/payment-methods/index', [
            'methods' => $methods,
            'stripeConfigured' => $this->stripeConfigured(),
            'billingError' => $billingError,
            'setupCompleted' => $request->boolean('added'),
        ]);
    }

    /**
     * Ouvre Stripe Checkout en mode "setup".
     * La carte est attachée automatiquement au Customer Stripe.
     */
    public function setup(Request $request): Response
    {
        abort_unless($this->stripeConfigured(), 503);

        $user = $request->user();

        try {
            $customer = $user->createOrGetStripeCustomer([
                'name' => $user->name,
                'email' => $user->email,
            ]);

            $stripe = new StripeClient((string) config('cashier.secret'));

            $session = $stripe->checkout->sessions->create([
                'mode' => 'setup',
                'customer' => $customer->id,
                'currency' => 'eur',
                'payment_method_types' => ['card'],
                'success_url' => route(
                    'client.account.payment-methods.index',
                ).'?added=1&session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route(
                    'client.account.payment-methods.index',
                ).'?cancelled=1',
                'locale' => 'fr',
                'setup_intent_data' => [
                    'description' => 'Moyen de paiement Astreon',
                    'metadata' => [
                        'astreon_user_id' => (string) $user->id,
                    ],
                ],
            ]);

            return Inertia::location((string) $session->url);
        } catch (Throwable $exception) {
            report($exception);

            return back()->with(
                'error',
                'Stripe n’a pas pu ouvrir la page sécurisée. Vérifiez STRIPE_KEY, STRIPE_SECRET et le mode test/live.',
            );
        }
    }

    public function makeDefault(
        Request $request,
        string $paymentMethod,
    ): RedirectResponse {
        $user = $request->user();

        abort_unless($user->hasStripeId(), 404);

        $method = $user->findPaymentMethod($paymentMethod);
        abort_if($method === null, 404);

        try {
            $user->updateDefaultPaymentMethod($method->id);
            $user->updateDefaultPaymentMethodFromStripe();
        } catch (Throwable $exception) {
            report($exception);

            return back()->with(
                'error',
                'Impossible de définir cette carte comme moyen de paiement par défaut.',
            );
        }

        app(AstreonMailer::class)->user(
            $user,
            'Moyen de paiement par défaut modifié',
            'FACTURATION ASTREON',
            'Carte par défaut mise à jour',
            'Votre moyen de paiement par défaut vient d’être modifié.',
            [],
            'Gérer mes cartes',
            url('/client/account/payment-methods'),
            null,
            'info',
            ['Carte' => strtoupper((string) ($method->card?->brand ?? 'CARTE')).' •••• '.($method->card?->last4 ?? '----')],
        );

        return back()->with(
            'success',
            'Moyen de paiement défini par défaut.',
        );
    }

    public function destroy(
        Request $request,
        string $paymentMethod,
    ): RedirectResponse {
        $user = $request->user();

        abort_unless($user->hasStripeId(), 404);

        $method = $user->findPaymentMethod($paymentMethod);
        abort_if($method === null, 404);

        try {
            $wasDefault = $user->defaultPaymentMethod()?->id === $method->id;

            $method->delete();

            if ($wasDefault) {
                $remaining = $user->paymentMethods('card')->first();

                if ($remaining !== null) {
                    $user->updateDefaultPaymentMethod($remaining->id);
                    $user->updateDefaultPaymentMethodFromStripe();
                }
            }
        } catch (Throwable $exception) {
            report($exception);

            return back()->with(
                'error',
                'Suppression impossible. Cette carte peut être utilisée par un abonnement actif.',
            );
        }

        app(AstreonMailer::class)->user(
            $user,
            'Moyen de paiement supprimé',
            'FACTURATION ASTREON',
            'Carte bancaire supprimée',
            'Un moyen de paiement a été retiré de votre compte.',
            [],
            'Gérer mes cartes',
            url('/client/account/payment-methods'),
            'Si vous ne reconnaissez pas cette action, sécurisez immédiatement votre compte.',
            'warning',
        );

        return back()->with('success', 'Moyen de paiement supprimé.');
    }

    private function finalizeCheckoutSession(Request $request): void
    {
        $sessionId = trim((string) $request->query('session_id'));

        if ($sessionId === '' || ! $request->boolean('added')) {
            return;
        }

        $user = $request->user();

        if (! $user->hasStripeId()) {
            return;
        }

        $stripe = new StripeClient((string) config('cashier.secret'));

        $session = $stripe->checkout->sessions->retrieve(
            $sessionId,
            ['expand' => ['setup_intent']],
        );

        $customerId = is_string($session->customer)
            ? $session->customer
            : $session->customer?->id;

        if ($customerId !== $user->stripe_id) {
            abort(403);
        }

        $paymentMethodId = is_string($session->setup_intent)
            ? null
            : $session->setup_intent?->payment_method;

        if (is_object($paymentMethodId)) {
            $paymentMethodId = $paymentMethodId->id;
        }

        if (is_string($paymentMethodId) && $paymentMethodId !== '') {
            $user->updateDefaultPaymentMethod($paymentMethodId);
            $user->updateDefaultPaymentMethodFromStripe();
        }
    }

    private function stripeConfigured(): bool
    {
        return filled(config('cashier.key'))
            && filled(config('cashier.secret'));
    }
}
