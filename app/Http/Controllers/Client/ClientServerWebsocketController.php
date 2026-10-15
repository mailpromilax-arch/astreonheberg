<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Services\Pterodactyl\PterodactylClient;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

class ClientServerWebsocketController extends Controller
{
    private const CACHE_TTL_SECONDS = 300;

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

        $cacheKey = "ptero:ws:{$service->id}:{$identifier}";

        // Si un token valide est en cache, on le renvoie sans appeler Pterodactyl.
        // Le parametre ?refresh=1 force un nouveau token (ex: token expiring).
        if (! $request->boolean('refresh')) {
            $cached = Cache::get($cacheKey);

            if (is_array($cached)
                && ! empty($cached['socket'])
                && ! empty($cached['token'])) {
                return response()->json($cached);
            }
        }

        // Si on est deja en cooldown suite a un 429, on ne retape pas l'API.
        $cooldownKey = "ptero:ws:cooldown:{$service->id}";

        if (Cache::has($cooldownKey)) {
            return response()->json([
                'message' => 'Trop de requetes, reessayez dans quelques secondes.',
            ], 429)->header('Retry-After', '10');
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

            $payload = [
                'socket' => $socket,
                'token' => $token,
            ];

            Cache::put($cacheKey, $payload, self::CACHE_TTL_SECONDS);

            return response()->json($payload);
        } catch (Throwable $exception) {
            $status = $exception instanceof RequestException
                ? $exception->response->status()
                : null;

            if ($status === 429) {
                Cache::put($cooldownKey, true, 10);

                Log::warning(
                    'Pterodactyl a renvoyé 429 pour les identifiants WebSocket.',
                    [
                        'service_id' => $service->id,
                        'identifier' => $identifier,
                    ],
                );

                return response()->json([
                    'message' => 'Trop de requetes, reessayez dans quelques secondes.',
                ], 429)->header('Retry-After', '10');
            }

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