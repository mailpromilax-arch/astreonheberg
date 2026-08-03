<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Pterodactyl\PterodactylInfrastructureSync;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Throwable;

final class InfrastructureSyncController extends Controller
{
    public function __invoke(
        Request $request,
        PterodactylInfrastructureSync $sync,
    ): RedirectResponse {
        try {
            $result = $sync->sync();
        } catch (Throwable $exception) {
            report($exception);

            return back()->with(
                'error',
                'Synchronisation impossible : '.$exception->getMessage(),
            );
        }

        return back()->with(
            'success',
            sprintf(
                'Synchronisation terminée : %d nœud(s), %d serveur(s), %d client(s) associé(s).',
                $result['nodes'],
                $result['servers'],
                $result['linked_users'],
            ),
        );
    }
}
