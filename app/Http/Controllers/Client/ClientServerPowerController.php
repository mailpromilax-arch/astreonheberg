<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Services\Pterodactyl\PterodactylClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class ClientServerPowerController extends Controller
{
    public function __invoke(
        Request $request,
        Service $service,
        PterodactylClient $pterodactyl,
    ): RedirectResponse {
        abort_unless(
            $service->user_id === $request->user()->id,
            403,
        );

        $validated = $request->validate([
            'signal' => [
                'required',
                'string',
                'in:start,stop,restart,kill',
            ],
        ]);

        $identifier = (string) data_get(
            $service->configuration,
            'pterodactyl.identifier',
        );

        if ($identifier === '') {
            return back()->with(
                'error',
                'Identifiant Pterodactyl introuvable.',
            );
        }

        try {
            $pterodactyl->sendPowerSignal(
                $identifier,
                $validated['signal'],
            );

            return back()->with(
                'success',
                'Commande envoyée au serveur.',
            );
        } catch (Throwable $exception) {
            Log::error('Commande Pterodactyl refusée.', [
                'service_id' => $service->id,
                'identifier' => $identifier,
                'signal' => $validated['signal'],
                'error' => $exception->getMessage(),
            ]);

            return back()->with(
                'error',
                'Pterodactyl a refusé la commande.',
            );
        }
    }
}