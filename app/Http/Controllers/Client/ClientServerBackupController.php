<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Services\Pterodactyl\PterodactylClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Throwable;

class ClientServerBackupController extends Controller
{
    public function index(
        Request $request,
        Service $service,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        try {
            $response = $client->listServerBackups($identifier);

            $backups = collect(data_get($response, 'data', []))
                ->map(function (array $backup): array {
                    $attributes = data_get(
                        $backup,
                        'attributes',
                        [],
                    );

                    return [
                        'uuid' => (string) data_get(
                            $attributes,
                            'uuid',
                        ),
                        'name' => (string) data_get(
                            $attributes,
                            'name',
                            'Sauvegarde',
                        ),
                        'ignored_files' => data_get(
                            $attributes,
                            'ignored_files',
                            [],
                        ),
                        'sha256_hash' => data_get(
                            $attributes,
                            'sha256_hash',
                        ),
                        'bytes' => (int) data_get(
                            $attributes,
                            'bytes',
                            0,
                        ),
                        'is_successful' => (bool) data_get(
                            $attributes,
                            'is_successful',
                            false,
                        ),
                        'is_locked' => (bool) data_get(
                            $attributes,
                            'is_locked',
                            false,
                        ),
                        'created_at' => data_get(
                            $attributes,
                            'created_at',
                        ),
                        'completed_at' => data_get(
                            $attributes,
                            'completed_at',
                        ),
                    ];
                })
                ->values();

            return response()->json([
                'backups' => $backups,
                'limit' => (int) data_get(
                    $service->configuration,
                    'delivered_resources.backups',
                    0,
                ),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Impossible de charger les sauvegardes.',
            ], 502);
        }
    }

    public function store(
        Request $request,
        Service $service,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:100'],
        ]);

        try {
            $response = $client->createServerBackup(
                $identifier,
                $validated['name'] ?? null,
            );

            return response()->json([
                'message' => 'Sauvegarde lancée.',
                'backup' => data_get(
                    $response,
                    'attributes',
                    data_get($response, 'data.attributes'),
                ),
            ], 201);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Impossible de créer la sauvegarde.',
            ], 502);
        }
    }

    public function destroy(
        Request $request,
        Service $service,
        string $backup,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        try {
            $client->deleteServerBackup(
                $identifier,
                $backup,
            );

            return response()->json([
                'message' => 'Sauvegarde supprimée.',
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Impossible de supprimer la sauvegarde.',
            ], 502);
        }
    }

    public function restore(
        Request $request,
        Service $service,
        string $backup,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        $validated = $request->validate([
            'truncate' => ['sometimes', 'boolean'],
        ]);

        try {
            $client->restoreServerBackup(
                $identifier,
                $backup,
                (bool) ($validated['truncate'] ?? true),
            );

            return response()->json([
                'message' => 'Restauration lancée.',
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Impossible de restaurer la sauvegarde.',
            ], 502);
        }
    }

    public function download(
        Request $request,
        Service $service,
        string $backup,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        try {
            $response = $client->getServerBackupDownload(
                $identifier,
                $backup,
            );

            return response()->json([
                'url' => (string) data_get(
                    $response,
                    'attributes.url',
                    data_get($response, 'data.attributes.url'),
                ),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Impossible de préparer le téléchargement.',
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