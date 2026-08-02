<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Services\Pterodactyl\PterodactylClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Throwable;

class ClientServerNetworkController extends Controller
{
    public function index(
        Request $request,
        Service $service,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        try {
            $response = $client->listServerAllocations($identifier);

            $allocations = collect(data_get($response, 'data', []))
                ->map(function (array $allocation): array {
                    $attributes = data_get(
                        $allocation,
                        'attributes',
                        [],
                    );

                    return [
                        'id' => (int) data_get(
                            $attributes,
                            'id',
                        ),
                        'ip' => (string) data_get(
                            $attributes,
                            'ip',
                        ),
                        'ip_alias' => data_get(
                            $attributes,
                            'ip_alias',
                        ),
                        'port' => (int) data_get(
                            $attributes,
                            'port',
                        ),
                        'notes' => (string) data_get(
                            $attributes,
                            'notes',
                            '',
                        ),
                        'is_default' => (bool) data_get(
                            $attributes,
                            'is_default',
                            false,
                        ),
                    ];
                })
                ->sortByDesc('is_default')
                ->values();

            return response()->json([
                'allocations' => $allocations,
                'limit' => (int) data_get(
                    $response,
                    'meta.pagination.total',
                    data_get(
                        $service->configuration,
                        'delivered_resources.allocations',
                        0,
                    ),
                ),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Impossible de charger les ports du serveur.',
            ], 502);
        }
    }

    public function store(
        Request $request,
        Service $service,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        try {
            $response = $client->createServerAllocation(
                $identifier,
            );

            return response()->json([
                'message' => 'Nouveau port attribué.',
                'allocation' => data_get(
                    $response,
                    'attributes',
                    data_get($response, 'data.attributes'),
                ),
            ], 201);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => $this->providerMessage(
                    $exception,
                    'Impossible d’attribuer un nouveau port.',
                ),
            ], 502);
        }
    }

    public function primary(
        Request $request,
        Service $service,
        int $allocation,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        try {
            $client->setServerPrimaryAllocation(
                $identifier,
                $allocation,
            );

            return response()->json([
                'message' => 'Port principal mis à jour.',
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Impossible de modifier le port principal.',
            ], 502);
        }
    }

    public function note(
        Request $request,
        Service $service,
        int $allocation,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:64'],
        ]);

        try {
            $client->updateServerAllocationNote(
                $identifier,
                $allocation,
                trim((string) ($validated['notes'] ?? '')),
            );

            return response()->json([
                'message' => 'Description enregistrée.',
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Impossible d’enregistrer la description.',
            ], 502);
        }
    }

    public function destroy(
        Request $request,
        Service $service,
        int $allocation,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        try {
            $client->deleteServerAllocation(
                $identifier,
                $allocation,
            );

            return response()->json([
                'message' => 'Port secondaire supprimé.',
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => $this->providerMessage(
                    $exception,
                    'Impossible de supprimer ce port.',
                ),
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

    private function providerMessage(
        Throwable $exception,
        string $fallback,
    ): string {
        $response = method_exists($exception, 'response')
            ? $exception->response
            : null;

        $detail = $response
            ? data_get($response->json(), 'errors.0.detail')
            : null;

        return is_string($detail) && $detail !== ''
            ? $detail
            : $fallback;
    }
}