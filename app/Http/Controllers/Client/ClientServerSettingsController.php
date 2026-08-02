<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Services\Pterodactyl\PterodactylClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Throwable;

class ClientServerSettingsController extends Controller
{
    public function index(
        Request $request,
        Service $service,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        try {
            $serverResponse = $client->getClientServer($identifier);

            // Selon la version de Pterodactyl, "attributes" peut être
            // directement à la racine ou dans "data.attributes".
            $attributes = (array) data_get(
                $serverResponse,
                'attributes',
                data_get($serverResponse, 'data.attributes', []),
            );

            $sftpUsername = (string) data_get(
                $attributes,
                'sftp_details.username',
                '',
            );

            // Pterodactyl construit généralement le login SFTP sous la forme :
            // nom_utilisateur.identifiant_serveur
            if ($sftpUsername === '') {
                $accountResponse = $client->getClientAccount();

                $accountAttributes = (array) data_get(
                    $accountResponse,
                    'attributes',
                    data_get($accountResponse, 'data.attributes', []),
                );

                $accountUsername = (string) data_get(
                    $accountAttributes,
                    'username',
                    '',
                );

                if ($accountUsername !== '') {
                    $sftpUsername = $accountUsername . '.' . $identifier;
                }
            }

            return response()->json([
                'name' => (string) data_get(
                    $attributes,
                    'name',
                    $service->name,
                ),
                'description' => (string) data_get(
                    $attributes,
                    'description',
                    '',
                ),
                'sftp' => [
                    'ip' => (string) data_get(
                        $attributes,
                        'sftp_details.ip',
                        'panel.astreon.shop',
                    ),
                    'port' => (int) data_get(
                        $attributes,
                        'sftp_details.port',
                        2022,
                    ),
                    'username' => $sftpUsername,
                ],
                'node' => (string) data_get(
                    $attributes,
                    'node',
                    '',
                ),
                'uuid' => (string) data_get(
                    $attributes,
                    'uuid',
                    '',
                ),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Impossible de charger les paramètres.',
            ], 502);
        }
    }

    public function update(
        Request $request,
        Service $service,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $client->renameClientServer(
                $identifier,
                $validated['name'],
                (string) ($validated['description'] ?? ''),
            );

            return response()->json([
                'message' => 'Serveur mis à jour.',
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Impossible de modifier le serveur.',
            ], 502);
        }
    }

    public function reinstall(
        Request $request,
        Service $service,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        try {
            $client->reinstallClientServer($identifier);

            return response()->json([
                'message' => 'Réinstallation lancée.',
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Impossible de réinstaller le serveur.',
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
