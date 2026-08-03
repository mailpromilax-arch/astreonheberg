<?php

declare(strict_types=1);

namespace App\Services\Mail;

use App\Models\User;
use App\Notifications\AstreonTransactionalNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Throwable;

final class AstreonMailer
{
    public function user(
        int|User|null $recipient,
        string $subject,
        string $eyebrow,
        string $title,
        string $intro,
        array $paragraphs = [],
        ?string $actionLabel = null,
        ?string $actionUrl = null,
        ?string $notice = null,
        string $severity = 'info',
        array $details = [],
    ): void {
        $user = $recipient instanceof User
            ? $recipient
            : (is_int($recipient) ? User::query()->find($recipient) : null);

        if ($user === null || blank($user->email)) {
            return;
        }

        try {
            $user->notify(new AstreonTransactionalNotification(
                $subject,
                $eyebrow,
                $title,
                $intro,
                $paragraphs,
                $actionLabel,
                $actionUrl,
                $notice,
                $severity,
                $details,
            ));
        } catch (Throwable $exception) {
            report($exception);

            Log::error('Échec de l’envoi d’un e-mail Astreon.', [
                'user_id' => $user->id,
                'subject' => $subject,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    public function admins(
        string $subject,
        string $eyebrow,
        string $title,
        string $intro,
        array $paragraphs = [],
        ?string $actionLabel = null,
        ?string $actionUrl = null,
        ?string $notice = null,
        string $severity = 'info',
        array $details = [],
        ?int $excludeUserId = null,
    ): void {
        if (! Schema::hasColumn('users', 'role')) {
            return;
        }

        User::query()
            ->whereIn('role', ['support', 'admin', 'super_admin'])
            ->when(
                $excludeUserId !== null,
                fn ($query) => $query->whereKeyNot($excludeUserId),
            )
            ->get()
            ->each(fn (User $admin) => $this->user(
                $admin,
                $subject,
                $eyebrow,
                $title,
                $intro,
                $paragraphs,
                $actionLabel,
                $actionUrl,
                $notice,
                $severity,
                $details,
            ));
    }
}
