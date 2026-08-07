<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Services\Pterodactyl\PterodactylClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

final class AutomaticBackupController extends Controller
{
    public function index(): Response
    {
        $services = Service::query()
            ->with('user:id,name,email')
            ->where('provider', 'pterodactyl')
            ->latest('id')
            ->get()
            ->map(fn (Service $service): array => [
                'id' => $service->id,
                'name' => $service->name,
                'reference' => $service->reference,
                'status' => $service->display_status,
                'backup_enabled' => (bool) $service->backup_enabled,
                'backup_frequency_hours' => (int) ($service->backup_frequency_hours ?: 24),
                'last_backup_at' => $service->last_backup_at?->toIso8601String(),
                'next_backup_at' => $service->next_backup_at?->toIso8601String(),
                'customer' => $service->user ? [
                    'name' => $service->user->name,
                    'email' => $service->user->email,
                ] : null,
            ]);

        return Inertia::render('admin/backups/index', ['services' => $services]);
    }

    public function update(Request $request, Service $service): RedirectResponse
    {
        $validated = $request->validate([
            'backup_enabled' => ['required', 'boolean'],
            'backup_frequency_hours' => ['required', 'integer', 'min:1', 'max:168'],
        ]);

        $service->forceFill([
            'backup_enabled' => $validated['backup_enabled'],
            'backup_frequency_hours' => $validated['backup_frequency_hours'],
            'next_backup_at' => $validated['backup_enabled']
                ? ($service->next_backup_at ?? now())
                : null,
        ])->save();

        return back()->with('success', 'Planification des sauvegardes mise à jour.');
    }

    public function create(Service $service, PterodactylClient $client): RedirectResponse
    {
        $identifier = (string) data_get($service->configuration, 'pterodactyl.identifier');
        abort_if($identifier === '', 422, 'Identifiant Pterodactyl introuvable.');

        try {
            $client->createServerBackup($identifier, 'Admin '.$service->reference.' '.now()->format('d-m-Y H:i'));
            $service->forceFill([
                'last_backup_at' => now(),
                'next_backup_at' => now()->addHours(max(1, (int) $service->backup_frequency_hours)),
            ])->save();
        } catch (Throwable $exception) {
            report($exception);
            return back()->with('error', 'La sauvegarde n’a pas pu être créée : '.$exception->getMessage());
        }

        return back()->with('success', 'Sauvegarde lancée sur Pterodactyl.');
    }
}
