<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Services\Pterodactyl\PterodactylClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class ClientServerWebsocketController extends Controller
{
    public function __invoke(
        Request $request,
        Service $service,
        PterodactylClient $pterodactyl,
    ): JsonResponse {
        abort_unless(
            (int) $service->user_id === (int) $request->user()->id,
            403,
        );

        $identifier = (string) data_get(
            $service->configuration,
            'pterodactyl.identifier',
        );

        if ($identifier === '') {
            return response()->json([
                'message' => 'Identifiant Pterodactyl introuvable.',
            ], 404);
        }

        try {
            $response = $pterodactyl
                ->getWebsocketCredentials($identifier);

            $socket = (string) data_get($response, 'data.socket');
            $token = (string) data_get($response, 'data.token');

            if ($socket === '' || $token === '') {
                Log::warning(
                    'Réponse WebSocket Pterodactyl incomplète.',
                    [
                        'service_id' => $service->id,
                        'identifier' => $identifier,
                        'response' => $response,
                    ],
                );

                return response()->json([
                    'message' => 'Réponse WebSocket Pterodactyl incomplète.',
                ], 502);
            }

            return response()->json([
                'socket' => $socket,
                'token' => $token,
            ]);
        } catch (Throwable $exception) {
            Log::error(
                'Impossible de récupérer les identifiants WebSocket Pterodactyl.',
                [
                    'service_id' => $service->id,
                    'identifier' => $identifier,
                    'error' => $exception->getMessage(),
                ],
            );

            report($exception);

            return response()->json([
                'message' => 'Impossible de récupérer la console.',
            ], 502);
        }
    }
}