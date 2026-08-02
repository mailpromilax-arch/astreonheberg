<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Services\Pterodactyl\PterodactylClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Throwable;

class ClientServerStartupController extends Controller
{
    public function index(
        Request $request,
        Service $service,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        try {
            $response = $client->getServerStartup($identifier);

            $variables = collect(
                data_get($response, 'data', []),
            )->map(function (array $variable): array {
                $attributes = data_get(
                    $variable,
                    'attributes',
                    [],
                );

                return [
                    'name' => (string) data_get(
                        $attributes,
                        'name',
                    ),
                    'description' => (string) data_get(
                        $attributes,
                        'description',
                        '',
                    ),
                    'env_variable' => (string) data_get(
                        $attributes,
                        'env_variable',
                    ),
                    'default_value' => (string) data_get(
                        $attributes,
                        'default_value',
                        '',
                    ),
                    'server_value' => (string) data_get(
                        $attributes,
                        'server_value',
                        '',
                    ),
                    'is_editable' => (bool) data_get(
                        $attributes,
                        'is_editable',
                        false,
                    ),
                    'rules' => (string) data_get(
                        $attributes,
                        'rules',
                        '',
                    ),
                ];
            })->values();

            $dockerImages = data_get(
                $response,
                'meta.docker_images',
                [],
            );

            $dockerImage = is_array($dockerImages)
                ? (string) (array_values($dockerImages)[0] ?? '')
                : '';

            return response()->json([
                'startup_command' => (string) data_get(
                    $response,
                    'meta.startup_command',
                    '',
                ),
                'raw_startup_command' => (string) data_get(
                    $response,
                    'meta.raw_startup_command',
                    '',
                ),
                'docker_image' => $dockerImage,
                'variables' => $variables,
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Impossible de charger les variables de démarrage.',
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
            'variables' => ['required', 'array', 'min:1', 'max:100'],
            'variables.*' => ['nullable'],
            'restart' => ['sometimes', 'boolean'],
        ]);

        try {
            $current = $client->getServerStartup($identifier);

            $allowedVariables = collect(
                data_get($current, 'data', []),
            )->map(
                fn (array $variable): array => (array) data_get(
                    $variable,
                    'attributes',
                    [],
                ),
            )->filter(
                fn (array $attributes): bool => (bool) data_get(
                    $attributes,
                    'is_editable',
                    false,
                ),
            )->pluck('env_variable')
                ->filter()
                ->map(
                    fn (mixed $value): string => (string) $value,
                )
                ->values()
                ->all();

            $submitted = $validated['variables'];
            $updated = [];

            foreach ($submitted as $key => $value) {
                $key = (string) $key;

                if (!in_array($key, $allowedVariables, true)) {
                    continue;
                }

                $client->updateServerStartupVariable(
                    $identifier,
                    $key,
                    is_bool($value)
                        ? ($value ? '1' : '0')
                        : (string) ($value ?? ''),
                );

                $updated[] = $key;
            }

            if ((bool) ($validated['restart'] ?? false)) {
                $client->sendPowerSignal(
                    $identifier,
                    'restart',
                );
            }

            return response()->json([
                'message' => (bool) ($validated['restart'] ?? false)
                    ? 'Variables enregistrées et redémarrage lancé.'
                    : 'Variables enregistrées.',
                'updated' => $updated,
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Impossible d’enregistrer les variables de démarrage.',
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