<?php

declare(strict_types=1);

namespace App\Observers;

use App\Services\Notifications\NotificationCenter;
use Illuminate\Database\Eloquent\Model;

final class AdminLogObserver
{
    public function __construct(
        private readonly NotificationCenter $notifications,
    ) {}

    public function created(Model $log): void
    {
        $targetUserId = $log->getAttribute('target_user_id');

        if (! is_numeric($targetUserId)) {
            return;
        }

        $action = (string) ($log->getAttribute('action') ?? 'admin.change');
        $description = trim((string) (
            $log->getAttribute('description')
            ?? 'Une modification a été effectuée sur votre compte.'
        ));

        [$title, $severity] = $this->presentation($action);

        $this->notifications->majorAccountChange(
            (int) $targetUserId,
            $action,
            $title,
            $description,
            is_numeric($log->getAttribute('user_id'))
                ? (int) $log->getAttribute('user_id')
                : null,
            $severity,
        );
    }

    private function presentation(string $action): array
    {
        $action = mb_strtolower($action);

        return match (true) {
            str_contains($action, 'two_factor'),
            str_contains($action, '2fa') => [
                'Sécurité du compte modifiée',
                'warning',
            ],

            str_contains($action, 'payment') => [
                'Moyen de paiement modifié',
                'warning',
            ],

            str_contains($action, 'password') => [
                'Mot de passe du compte modifié',
                'danger',
            ],

            str_contains($action, 'service'),
            str_contains($action, 'server') => [
                'Service modifié',
                'warning',
            ],

            default => [
                'Modification administrative',
                'info',
            ],
        };
    }
}
