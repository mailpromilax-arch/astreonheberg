<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Services\Pterodactyl\PterodactylClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Validation\ValidationException;
use Throwable;

class ClientServerDatabaseController extends Controller
{
    public function index(
        Request $request,
        Service $service,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        try {
            $response = $client->listServerDatabases($identifier);

            $savedPasswords = $this->databasePasswords($service);

            $databases = collect(data_get($response, 'data', []))
                ->map(function (array $database) use ($savedPasswords): array {
                    $attributes = data_get(
                        $database,
                        'attributes',
                        [],
                    );

                    $databaseId = (string) data_get(
                        $attributes,
                        'id',
                    );

                    return [
                        'id' => $databaseId,
                        'host' => [
                            'address' => (string) data_get(
                                $attributes,
                                'host.address',
                            ),
                            'port' => (int) data_get(
                                $attributes,
                                'host.port',
                                3306,
                            ),
                        ],
                        'name' => (string) data_get(
                            $attributes,
                            'name',
                        ),
                        'username' => (string) data_get(
                            $attributes,
                            'username',
                        ),
                        'connections_from' => (string) data_get(
                            $attributes,
                            'connections_from',
                            '%',
                        ),
                        'max_connections' => (int) data_get(
                            $attributes,
                            'max_connections',
                            0,
                        ),
                        'password' => $savedPasswords[$databaseId] ?? null,
                    ];
                })
                ->values();

            return response()->json([
                'databases' => $databases,
                'limit' => (int) data_get(
                    $service->configuration,
                    'delivered_resources.databases',
                    0,
                ),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Impossible de charger les bases de données.',
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
            'database' => [
                'required',
                'string',
                'min:1',
                'max:48',
                'regex:/^[a-zA-Z0-9_-]+$/',
            ],
            'remote' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        try {
            $response = $client->createServerDatabase(
                $identifier,
                $validated['database'],
                $validated['remote'],
            );

            $attributes = data_get(
                $response,
                'attributes',
                data_get($response, 'data.attributes', []),
            );

            $databaseId = (string) data_get(
                $attributes,
                'id',
            );

            $password = (string) data_get(
                $attributes,
                'relationships.password.attributes.password',
                data_get(
                    $response,
                    'data.attributes.relationships.password.attributes.password',
                ),
            );

            if ($databaseId !== '' && $password !== '') {
                $this->rememberDatabasePassword(
                    $service,
                    $databaseId,
                    $password,
                );
            }

            return response()->json([
                'message' => 'Base de données créée.',
                'database' => [
                    'id' => $databaseId,
                    'host' => [
                        'address' => (string) data_get(
                            $attributes,
                            'host.address',
                        ),
                        'port' => (int) data_get(
                            $attributes,
                            'host.port',
                            3306,
                        ),
                    ],
                    'name' => (string) data_get(
                        $attributes,
                        'name',
                    ),
                    'username' => (string) data_get(
                        $attributes,
                        'username',
                    ),
                    'connections_from' => (string) data_get(
                        $attributes,
                        'connections_from',
                        '%',
                    ),
                    'password' => $password !== '' ? $password : null,
                ],
            ], 201);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Impossible de créer la base de données.',
            ], 502);
        }
    }

    public function rotate(
        Request $request,
        Service $service,
        string $database,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        try {
            $response = $client->rotateServerDatabasePassword(
                $identifier,
                $database,
            );

            $password = data_get(
                $response,
                'attributes.password',
                data_get(
                    $response,
                    'data.attributes.password',
                    data_get(
                        $response,
                        'attributes.relationships.password.attributes.password',
                        data_get(
                            $response,
                            'data.attributes.relationships.password.attributes.password',
                            data_get(
                                $response,
                                'relationships.password.attributes.password',
                                data_get(
                                    $response,
                                    'data.relationships.password.attributes.password',
                                ),
                            ),
                        ),
                    ),
                ),
            );

            if (!is_string($password) || $password === '') {
                logger()->warning(
                    'Réponse Pterodactyl sans mot de passe après rotation.',
                    [
                        'service_id' => $service->id,
                        'database_id' => $database,
                        'response' => $response,
                    ],
                );

                return response()->json([
                    'message' => 'Le mot de passe a été renouvelé, mais Pterodactyl ne l’a pas renvoyé.',
                ], 502);
            }

            $this->rememberDatabasePassword(
                $service,
                $database,
                $password,
            );

            return response()->json([
                'message' => 'Mot de passe renouvelé.',
                'password' => $password,
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Impossible de renouveler le mot de passe.',
            ], 502);
        }
    }

    public function destroy(
        Request $request,
        Service $service,
        string $database,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        try {
            $client->deleteServerDatabase(
                $identifier,
                $database,
            );

            $this->forgetDatabasePassword(
                $service,
                $database,
            );

            return response()->json([
                'message' => 'Base de données supprimée.',
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Impossible de supprimer la base de données.',
            ], 502);
        }
    }

    /**
     * @return array<string, string>
     */
    private function databasePasswords(Service $service): array
    {
        $encryptedPasswords = data_get(
            $service->configuration,
            'pterodactyl.database_passwords',
            [],
        );

        if (!is_array($encryptedPasswords)) {
            return [];
        }

        $passwords = [];

        foreach ($encryptedPasswords as $databaseId => $encryptedPassword) {
            if (!is_string($encryptedPassword) || $encryptedPassword === '') {
                continue;
            }

            try {
                $passwords[(string) $databaseId] = Crypt::decryptString(
                    $encryptedPassword,
                );
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        return $passwords;
    }

    private function rememberDatabasePassword(
        Service $service,
        string $databaseId,
        string $password,
    ): void {
        $configuration = $service->configuration ?? [];

        if (!is_array($configuration)) {
            $configuration = [];
        }

        data_set(
            $configuration,
            "pterodactyl.database_passwords.{$databaseId}",
            Crypt::encryptString($password),
        );

        $service->forceFill([
            'configuration' => $configuration,
        ])->save();
    }

    private function forgetDatabasePassword(
        Service $service,
        string $databaseId,
    ): void {
        $configuration = $service->configuration ?? [];

        if (!is_array($configuration)) {
            return;
        }

        data_forget(
            $configuration,
            "pterodactyl.database_passwords.{$databaseId}",
        );

        $service->forceFill([
            'configuration' => $configuration,
        ])->save();
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