<?php

declare(strict_types=1);

namespace App\Http\Controllers\Notifications;

use App\Http\Controllers\Controller;
use App\Models\PlatformNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class NotificationController extends Controller
{
    public function clientIndex(Request $request): Response
    {
        return Inertia::render('client/notifications/index', [
            'notifications' => $this->paginated($request),
        ]);
    }

    public function adminIndex(Request $request): Response
    {
        return Inertia::render('admin/notifications/index', [
            'notifications' => $this->paginated($request),
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $query = PlatformNotification::query()
            ->where('user_id', $request->user()->id);

        return response()->json([
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
                ]),
        ]);
    }

    public function read(
        Request $request,
        PlatformNotification $notification,
    ): RedirectResponse|JsonResponse {
        abort_unless(
            (int) $notification->user_id === (int) $request->user()->id,
            403,
        );

        if ($notification->read_at === null) {
            $notification->forceFill(['read_at' => now()])->save();
        }

        if ($request->expectsJson()) {
            return response()->json(['success' => true]);
        }

        return back();
    }

    public function readAll(Request $request): RedirectResponse|JsonResponse
    {
        PlatformNotification::query()
            ->where('user_id', $request->user()->id)
            ->unread()
            ->update([
                'read_at' => now(),
                'updated_at' => now(),
            ]);

        if ($request->expectsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with(
            'success',
            'Toutes les notifications ont été marquées comme lues.',
        );
    }

    public function destroy(
        Request $request,
        PlatformNotification $notification,
    ): RedirectResponse {
        abort_unless(
            (int) $notification->user_id === (int) $request->user()->id,
            403,
        );

        $notification->delete();

        return back();
    }

    private function paginated(Request $request): mixed
    {
        return PlatformNotification::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (PlatformNotification $notification): array => [
                'id' => $notification->id,
                'type' => $notification->type,
                'title' => $notification->title,
                'message' => $notification->message,
                'url' => $notification->url,
                'icon' => $notification->icon,
                'severity' => $notification->severity,
                'read_at' => $notification->read_at?->toISOString(),
                'created_at' => $notification->created_at?->toISOString(),
            ]);
    }
}
