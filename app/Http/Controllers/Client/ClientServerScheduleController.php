<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Services\Pterodactyl\PterodactylClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

class ClientServerScheduleController extends Controller
{
    public function index(
        Request $request,
        Service $service,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        try {
            return response()->json([
                'schedules' => $this->mapSchedules(
                    $client->listServerSchedules($identifier),
                ),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return $this->error(
                $exception,
                'Impossible de charger les tâches planifiées.',
            );
        }
    }

    public function store(
        Request $request,
        Service $service,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);
        $validated = $this->validateSchedule($request);

        try {
            $response = $client->createServerSchedule(
                $identifier,
                $validated,
            );

            return response()->json([
                'message' => 'Planification créée.',
                'schedule' => $this->mapSchedule(
                    (array) data_get(
                        $response,
                        'attributes',
                        data_get($response, 'data.attributes', []),
                    ),
                ),
            ], 201);
        } catch (Throwable $exception) {
            report($exception);

            return $this->error(
                $exception,
                'Impossible de créer la planification.',
            );
        }
    }

    public function update(
        Request $request,
        Service $service,
        int $schedule,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);
        $validated = $this->validateSchedule($request);

        try {
            $client->updateServerSchedule(
                $identifier,
                $schedule,
                $validated,
            );

            return response()->json([
                'message' => 'Planification mise à jour.',
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return $this->error(
                $exception,
                'Impossible de modifier la planification.',
            );
        }
    }

    public function execute(
        Request $request,
        Service $service,
        int $schedule,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        try {
            $client->executeServerSchedule(
                $identifier,
                $schedule,
            );

            return response()->json([
                'message' => 'Exécution immédiate lancée.',
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return $this->error(
                $exception,
                'Impossible d’exécuter cette planification.',
            );
        }
    }

    public function destroy(
        Request $request,
        Service $service,
        int $schedule,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        try {
            $client->deleteServerSchedule(
                $identifier,
                $schedule,
            );

            return response()->json([
                'message' => 'Planification supprimée.',
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return $this->error(
                $exception,
                'Impossible de supprimer cette planification.',
            );
        }
    }

    public function storeTask(
        Request $request,
        Service $service,
        int $schedule,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);
        $validated = $this->validateTask($request);

        try {
            $client->createServerScheduleTask(
                $identifier,
                $schedule,
                $validated,
            );

            return response()->json([
                'message' => 'Action ajoutée.',
            ], 201);
        } catch (Throwable $exception) {
            report($exception);

            return $this->error(
                $exception,
                'Impossible d’ajouter cette action.',
            );
        }
    }

    public function updateTask(
        Request $request,
        Service $service,
        int $schedule,
        int $task,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);
        $validated = $this->validateTask($request);

        try {
            $client->updateServerScheduleTask(
                $identifier,
                $schedule,
                $task,
                $validated,
            );

            return response()->json([
                'message' => 'Action mise à jour.',
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return $this->error(
                $exception,
                'Impossible de modifier cette action.',
            );
        }
    }

    public function destroyTask(
        Request $request,
        Service $service,
        int $schedule,
        int $task,
        PterodactylClient $client,
    ): JsonResponse {
        $identifier = $this->identifier($request, $service);

        try {
            $client->deleteServerScheduleTask(
                $identifier,
                $schedule,
                $task,
            );

            return response()->json([
                'message' => 'Action supprimée.',
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return $this->error(
                $exception,
                'Impossible de supprimer cette action.',
            );
        }
    }

    private function validateSchedule(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'minute' => ['required', 'string', 'max:32'],
            'hour' => ['required', 'string', 'max:32'],
            'day_of_month' => ['required', 'string', 'max:32'],
            'month' => ['required', 'string', 'max:32'],
            'day_of_week' => ['required', 'string', 'max:32'],
            'is_active' => ['required', 'boolean'],
            'only_when_online' => ['required', 'boolean'],
        ]);
    }

    private function validateTask(Request $request): array
    {
        $validated = $request->validate([
            'action' => [
                'required',
                Rule::in(['command', 'power', 'backup']),
            ],
            'payload' => ['nullable', 'string', 'max:4096'],
            'time_offset' => ['required', 'integer', 'min:0', 'max:900'],
            'continue_on_failure' => ['required', 'boolean'],
        ]);

        if ($validated['action'] === 'power') {
            validator(
                ['payload' => $validated['payload']],
                [
                    'payload' => [
                        'required',
                        Rule::in(['start', 'stop', 'restart', 'kill']),
                    ],
                ],
            )->validate();
        }

        if (
            $validated['action'] === 'command' &&
            trim((string) $validated['payload']) === ''
        ) {
            throw ValidationException::withMessages([
                'payload' => 'La commande est obligatoire.',
            ]);
        }

        if ($validated['action'] === 'backup') {
            $validated['payload'] = '';
        }

        return $validated;
    }

    private function mapSchedules(array $response): array
    {
        return collect(data_get($response, 'data', []))
            ->map(
                fn (array $schedule): array => $this->mapSchedule(
                    (array) data_get($schedule, 'attributes', []),
                ),
            )
            ->values()
            ->all();
    }

    private function mapSchedule(array $attributes): array
    {
        return [
            'id' => (int) data_get($attributes, 'id'),
            'name' => (string) data_get($attributes, 'name'),
            'cron' => [
                'minute' => (string) data_get(
                    $attributes,
                    'cron.minute',
                    '*',
                ),
                'hour' => (string) data_get(
                    $attributes,
                    'cron.hour',
                    '*',
                ),
                'day_of_month' => (string) data_get(
                    $attributes,
                    'cron.day_of_month',
                    '*',
                ),
                'month' => (string) data_get(
                    $attributes,
                    'cron.month',
                    '*',
                ),
                'day_of_week' => (string) data_get(
                    $attributes,
                    'cron.day_of_week',
                    '*',
                ),
            ],
            'is_active' => (bool) data_get(
                $attributes,
                'is_active',
                false,
            ),
            'is_processing' => (bool) data_get(
                $attributes,
                'is_processing',
                false,
            ),
            'only_when_online' => (bool) data_get(
                $attributes,
                'only_when_online',
                false,
            ),
            'last_run_at' => data_get(
                $attributes,
                'last_run_at',
            ),
            'next_run_at' => data_get(
                $attributes,
                'next_run_at',
            ),
            'tasks' => collect(
                data_get($attributes, 'relationships.tasks.data', []),
            )->map(function (array $task): array {
                $taskAttributes = (array) data_get(
                    $task,
                    'attributes',
                    [],
                );

                return [
                    'id' => (int) data_get(
                        $taskAttributes,
                        'id',
                    ),
                    'sequence_id' => (int) data_get(
                        $taskAttributes,
                        'sequence_id',
                    ),
                    'action' => (string) data_get(
                        $taskAttributes,
                        'action',
                    ),
                    'payload' => (string) data_get(
                        $taskAttributes,
                        'payload',
                        '',
                    ),
                    'time_offset' => (int) data_get(
                        $taskAttributes,
                        'time_offset',
                        0,
                    ),
                    'continue_on_failure' => (bool) data_get(
                        $taskAttributes,
                        'continue_on_failure',
                        false,
                    ),
                ];
            })->sortBy('sequence_id')->values()->all(),
        ];
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

    private function error(
        Throwable $exception,
        string $fallback,
    ): JsonResponse {
        $response = method_exists($exception, 'response')
            ? $exception->response
            : null;

        $detail = $response
            ? data_get($response->json(), 'errors.0.detail')
            : null;

        return response()->json([
            'message' => is_string($detail) && $detail !== ''
                ? $detail
                : $fallback,
        ], 502);
    }
}
