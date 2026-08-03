<?php

declare(strict_types=1);

namespace App\Services\Notifications;

use App\Models\PlatformNotification;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

final class NotificationCenter
{
    public function client(
        int|User $recipient,
        string $type,
        string $title,
        string $message,
        ?string $url = null,
        string $severity = 'info',
        string $icon = 'bell',
        int|User|null $actor = null,
        ?string $subjectType = null,
        ?int $subjectId = null,
        array $data = [],
    ): ?PlatformNotification {
        $recipientId = $recipient instanceof User
            ? (int) $recipient->id
            : $recipient;

        return $this->create(
            $recipientId,
            $type,
            $title,
            $message,
            $url,
            $severity,
            $icon,
            $actor,
            $subjectType,
            $subjectId,
            $data,
        );
    }

    public function admins(
        string $type,
        string $title,
        string $message,
        ?string $url = null,
        string $severity = 'info',
        string $icon = 'bell',
        int|User|null $actor = null,
        ?string $subjectType = null,
        ?int $subjectId = null,
        array $data = [],
        ?int $excludeUserId = null,
    ): void {
        foreach ($this->adminRecipients($excludeUserId) as $admin) {
            $this->create(
                (int) $admin->id,
                $type,
                $title,
                $message,
                $url,
                $severity,
                $icon,
                $actor,
                $subjectType,
                $subjectId,
                $data,
            );
        }
    }

    public function majorAccountChange(
        int|User $client,
        string $type,
        string $title,
        string $message,
        int|User|null $actor = null,
        string $severity = 'warning',
        ?string $url = null,
        array $data = [],
    ): void {
        $clientId = $client instanceof User
            ? (int) $client->id
            : $client;

        $actorName = $this->actorName($actor);

        $this->client(
            $clientId,
            $type,
            $title,
            $message,
            $url ?? '/client/account',
            $severity,
            'shield',
            $actor,
            User::class,
            $clientId,
            [
                ...$data,
                'actor_name' => $actorName,
            ],
        );

        $this->admins(
            $type,
            $title,
            $message,
            "/admin/users/{$clientId}",
            $severity,
            'activity',
            $actor,
            User::class,
            $clientId,
            [
                ...$data,
                'client_id' => $clientId,
                'actor_name' => $actorName,
            ],
        );
    }

    private function create(
        int $recipientId,
        string $type,
        string $title,
        string $message,
        ?string $url,
        string $severity,
        string $icon,
        int|User|null $actor,
        ?string $subjectType,
        ?int $subjectId,
        array $data,
    ): ?PlatformNotification {
        if (
            ! Schema::hasTable('platform_notifications')
            || ! DB::table('users')->where('id', $recipientId)->exists()
        ) {
            return null;
        }

        $actorId = $actor instanceof User
            ? (int) $actor->id
            : $actor;

        return PlatformNotification::query()->create([
            'user_id' => $recipientId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'url' => $url,
            'icon' => $icon,
            'severity' => $severity,
            'actor_id' => $actorId,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'data' => $data,
        ]);
    }

    private function adminRecipients(?int $excludeUserId = null): Collection
    {
        $query = User::query();

        if (Schema::hasColumn('users', 'role')) {
            $query->whereIn('role', [
                'support',
                'admin',
                'super_admin',
            ]);
        } else {
            $query->whereRaw('1 = 0');
        }

        if ($excludeUserId !== null) {
            $query->whereKeyNot($excludeUserId);
        }

        return $query->get(['id', 'name', 'email']);
    }

    private function actorName(int|User|null $actor): string
    {
        if ($actor instanceof User) {
            return $actor->name;
        }

        if (is_int($actor)) {
            return (string) User::query()->whereKey($actor)->value('name')
                ?: 'Administrateur';
        }

        return 'Système';
    }
}
