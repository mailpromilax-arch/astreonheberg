<?php

declare(strict_types=1);

namespace App\Services\Billing;

use App\Models\RenewalAttempt;
use App\Models\Service;
use App\Services\Mail\AstreonMailer;
use App\Services\Pterodactyl\PterodactylClient;
use App\Services\Security\PaymentFraudGuard;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;
use Throwable;

final class AutoRenewalService
{
    public function __construct(
        private readonly AstreonMailer $mailer,
        private readonly InvoiceService $invoices,
        private readonly PterodactylClient $pterodactyl,
        private readonly PaymentFraudGuard $fraud,
    ) {}

    public function process(Service $service): string
    {
        $service->loadMissing(['user', 'plan', 'order']);
        $user = $service->user;

        if (! $user || ! $service->expires_at || ! $service->auto_renew) {
            return 'skipped';
        }

        $price = (int) ($service->renewal_price_cents ?: $service->plan?->price_monthly_cents ?: 0);
        if ($price <= 0) {
            return 'skipped';
        }

        $reference = 'renewal-'.$service->id.'-'.$service->expires_at->format('YmdHi');

        $existing = RenewalAttempt::query()->where('reference', $reference)->first();
        if ($existing?->status === 'succeeded') {
            return 'already-renewed';
        }

        try {
            $this->fraud->assertAllowed($user, 'automatic_renewal', $price);

            if (! $user->hasStripeId()) {
                throw new RuntimeException('Aucun compte Stripe n’est associé à ce client.');
            }

            $paymentMethod = $user->defaultPaymentMethod();
            if (! $paymentMethod) {
                throw new RuntimeException('Aucune carte par défaut n’est enregistrée.');
            }

            $attempt = RenewalAttempt::query()->firstOrCreate(
                ['reference' => $reference],
                [
                    'service_id' => $service->id,
                    'user_id' => $user->id,
                    'provider' => 'stripe',
                    'amount_cents' => $price,
                    'currency' => 'EUR',
                    'status' => 'pending',
                    'metadata' => ['payment_method' => $paymentMethod->id],
                ],
            );

            if ($attempt->status === 'processing') {
                return 'processing';
            }

            $attempt->forceFill(['status' => 'processing'])->save();

            $stripe = new StripeClient((string) config('cashier.secret'));
            $intent = $stripe->paymentIntents->create([
                'amount' => $price,
                'currency' => 'eur',
                'customer' => $user->stripe_id,
                'payment_method' => $paymentMethod->id,
                'off_session' => true,
                'confirm' => true,
                'description' => 'Renouvellement Astreon — '.$service->name,
                'metadata' => [
                    'astreon_service_id' => (string) $service->id,
                    'astreon_user_id' => (string) $user->id,
                    'astreon_reference' => $reference,
                ],
            ], ['idempotency_key' => $reference]);

            if ($intent->status !== 'succeeded') {
                throw new RuntimeException('Stripe demande une action supplémentaire : '.$intent->status);
            }

            DB::transaction(function () use ($service, $attempt, $intent): void {
                $locked = Service::query()->lockForUpdate()->findOrFail($service->id);
                $base = $locked->expires_at && $locked->expires_at->isFuture()
                    ? $locked->expires_at
                    : now();

                $locked->forceFill([
                    'expires_at' => $base->copy()->addMonth(),
                    'status' => 'active',
                    'suspended_at' => null,
                    'renewal_failed_at' => null,
                    'renewal_reminded_at' => null,
                ])->save();

                $attempt->forceFill([
                    'provider_payment_id' => $intent->id,
                    'status' => 'succeeded',
                    'processed_at' => now(),
                ])->save();
            }, 3);

            $service->refresh();
            $this->unsuspendRemote($service);

            if ($service->order && $service->order->status === 'paid') {
                $this->invoices->forPaidOrder($service->order, false);
            }

            $this->mailer->user(
                $user,
                'Renouvellement confirmé — '.$service->name,
                'RENOUVELLEMENT CONFIRMÉ',
                'Votre service a été renouvelé',
                'Le paiement automatique a été accepté avec votre carte enregistrée.',
                ['Nouvelle échéance : '.$service->expires_at?->format('d/m/Y à H:i').'.'],
                'Voir mon service',
                route('client.services.show', $service),
                null,
                'success',
                ['Montant' => number_format($price / 100, 2, ',', ' ').' €'],
            );

            return 'renewed';
        } catch (Throwable $exception) {
            report($exception);
            $this->markFailed($service, $reference, $price, $exception);
            return 'failed';
        }
    }

    public function sendReminder(Service $service): void
    {
        $service->loadMissing('user');
        if (! $service->user || $service->renewal_reminded_at) {
            return;
        }

        $hasCard = $service->user->hasStripeId() && $service->user->defaultPaymentMethod() !== null;

        $this->mailer->user(
            $service->user,
            'Échéance prochaine — '.$service->name,
            'RENOUVELLEMENT À VENIR',
            'Votre service expire bientôt',
            'Votre service '.$service->name.' expire le '.$service->expires_at?->format('d/m/Y à H:i').'.',
            [$service->auto_renew
                ? ($hasCard
                    ? 'Votre carte enregistrée par défaut sera utilisée automatiquement.'
                    : 'Ajoutez une carte par défaut pour permettre le renouvellement automatique.')
                : 'Le renouvellement automatique est désactivé.'],
            'Gérer mes moyens de paiement',
            route('client.account.payment-methods.index'),
            null,
            $hasCard ? 'info' : 'warning',
        );

        $service->forceFill(['renewal_reminded_at' => now()])->save();
    }

    private function markFailed(Service $service, string $reference, int $price, Throwable $exception): void
    {
        RenewalAttempt::query()->updateOrCreate(
            ['reference' => $reference],
            [
                'service_id' => $service->id,
                'user_id' => $service->user_id,
                'provider' => 'stripe',
                'amount_cents' => $price,
                'currency' => 'EUR',
                'status' => 'failed',
                'failure_message' => mb_substr($exception->getMessage(), 0, 2000),
                'processed_at' => now(),
            ],
        );

        $service->forceFill([
            'status' => 'suspended',
            'suspended_at' => now(),
            'renewal_failed_at' => now(),
        ])->save();

        $this->suspendRemote($service);
        $this->fraud->record($service->user, 'renewal_failed', 'warning', [
            'service_id' => $service->id,
            'reference' => $reference,
            'message' => $exception->getMessage(),
        ]);

        $this->mailer->user(
            $service->user,
            'Paiement de renouvellement refusé — '.$service->name,
            'ACTION REQUISE',
            'Votre renouvellement automatique a échoué',
            'La carte enregistrée n’a pas pu être débitée.',
            ['Mettez à jour votre carte par défaut puis régularisez le service depuis votre espace client.'],
            'Mettre à jour ma carte',
            route('client.account.payment-methods.index'),
            'Le service a été suspendu pour éviter toute consommation non réglée.',
            'danger',
        );
    }

    private function suspendRemote(Service $service): void
    {
        if (is_numeric($service->external_id)) {
            try { $this->pterodactyl->suspendServer((int) $service->external_id); } catch (Throwable $e) { report($e); }
        }
    }

    private function unsuspendRemote(Service $service): void
    {
        if (is_numeric($service->external_id)) {
            try { $this->pterodactyl->unsuspendServer((int) $service->external_id); } catch (Throwable $e) { report($e); }
        }
    }
}
