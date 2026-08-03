<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\PlatformNotification;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

final class ShareNotificationCenter
{
    public function handle(Request $request, Closure $next): Response
    {
        Inertia::share(
            'notification_center',
            fn (): array => $this->summary($request),
        );

        return $next($request);
    }

    private function summary(Request $request): array
    {
        $user = $request->user();

        if (
            $user === null
            || ! Schema::hasTable('platform_notifications')
        ) {
            return [
                'unread_count' => 0,
                'latest' => [],
            ];
        }

        $query = PlatformNotification::query()
            ->where('user_id', $user->id);

        return [
            'unread_count' => (clone $query)->unread()->count(),
            'latest' => (clone $query)
                ->latest()
                ->limit(8)
                ->get()
                ->map(fn (PlatformNotification $notification): array => [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'url' => $notification->url,
                    'icon' => $notification->icon,
                    'severity' => $notification->severity,
                    'read_at' => $notification->read_at?->toISOString(),
                    'created_at' => $notification->created_at?->toISOString(),
                ])
                ->all(),
        ];
    }
}
