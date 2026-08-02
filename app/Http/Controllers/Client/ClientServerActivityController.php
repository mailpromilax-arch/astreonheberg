<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Services\Pterodactyl\PterodactylClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Throwable;

class ClientServerActivityController extends Controller
{
    public function index(
        Request $request,
        Service $service,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        try {
            $response = $client->listServerActivity($identifier);

            $items = collect(data_get($response, 'data', []))
                ->map(function ($item): array {
                    $attributes = (array) data_get($item, 'attributes', []);

                    return [
                        'id' => (string) data_get(
                            $attributes,
                            'id',
                            md5((string) json_encode($attributes)),
                        ),
                        'event' => (string) data_get(
                            $attributes,
                            'event',
                            'activity',
                        ),
                        'description' => (string) data_get(
                            $attributes,
                            'properties.description',
                            data_get(
                                $attributes,
                                'event',
                                'Action effectuée',
                            ),
                        ),
                        'ip' => (string) data_get(
                            $attributes,
                            'ip',
                            '',
                        ),
                        'timestamp' => (string) data_get(
                            $attributes,
                            'timestamp',
                            now()->toIso8601String(),
                        ),
                        'actor' => (string) data_get(
                            $attributes,
                            'relationships.actor.attributes.username',
                            'Utilisateur',
                        ),
                    ];
                })
                ->values();

            return response()->json([
                'activity' => $items,
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Impossible de charger le journal d’activité.',
            ], 502);
        }
    }

    private function identifier(
        Request $request,
        Service $service,
    ): string {
        abort_unless(
            (int) $service->user_id === (int) $request->user()->id,
            403,
        );

        $identifier = (string) data_get(
            $service->configuration,
            'pterodactyl.identifier',
        );

        if ($identifier === '') {
            throw ValidationException::withMessages([
                'service' => 'Identifiant Pterodactyl introuvable.',
            ]);
        }

        return $identifier;
    }
}
