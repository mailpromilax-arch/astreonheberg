<?php

declare(strict_types=1);

namespace App\Services\Security;

use App\Models\FraudEvent;
use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;
use RuntimeException;

final class PaymentFraudGuard
{
    public function assertAllowed(User $user, string $operation, int $amountCents): void
    {
        if ($amountCents <= 0 || $amountCents > 500000) {
            $this->record($user, 'invalid_amount', 'critical', compact('operation', 'amountCents'));
            throw new RuntimeException('Montant de paiement invalide.');
        }

        $key = "payments:{$operation}:user:{$user->id}";
        if (RateLimiter::tooManyAttempts($key, 8)) {
            $this->record($user, 'payment_rate_limit', 'critical', compact('operation', 'amountCents'));
            throw new RuntimeException('Trop de tentatives de paiement. Réessayez plus tard.');
        }

        RateLimiter::hit($key, 300);
    }

    public function record(User $user, string $event, string $severity, array $context = []): void
    {
        FraudEvent::query()->create([
            'user_id' => $user->id,
            'event' => $event,
            'severity' => $severity,
            'ip_address' => request()?->ip(),
            'route' => request()?->path(),
            'user_agent' => request()?->userAgent(),
            'context' => $context,
        ]);
    }
}
