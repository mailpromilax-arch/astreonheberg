<?php

namespace App\Services\Pterodactyl;

use App\Models\User;
use Illuminate\Support\Str;
use RuntimeException;

class PterodactylServerService
{
    public function __construct(
        private readonly PterodactylClient $client,
        private readonly PterodactylUserService $users,
        private readonly PterodactylAllocationService $allocations,
    ) {
    }

    /**
     * @param array<string, mixed> $configuration
     *
     * @return array<string, mixed>
     */
    public function create(
        User $owner,
        array $configuration,
    ): array {
        $nodeId = (int) data_get(
            $configuration,
            'node_id',
        );

        $nestId = (int) data_get(
            $configuration,
            'nest_id',
        );

        $eggId = (int) data_get(
            $configuration,
            'egg_id',
        );

        if (
            $nodeId < 1
            || $nestId < 1
            || $eggId < 1
        ) {
            throw new RuntimeException(
                'Node, Nest ou Egg Pterodactyl invalide.',
            );
        }

        $pterodactylUser = $this->users
            ->findOrCreate($owner);

        $userAttributes = data_get(
            $pterodactylUser,
            'user.attributes',
            [],
        );

        $pterodactylUserId = (int) data_get(
            $userAttributes,
            'id',
        );

        if ($pterodactylUserId < 1) {
            throw new RuntimeException(
                'Impossible de déterminer le propriétaire Pterodactyl.',
            );
        }

        $preferredPorts = array_map(
            'intval',
            data_get(
                $configuration,
                'preferred_ports',
                [],
            ),
        );

        $allocation = $this->allocations
            ->findAvailable(
                $nodeId,
                $preferredPorts,
            );

        $eggResponse = $this->client->getEgg(
            $nestId,
            $eggId,
            true,
        );

        $egg = data_get(
            $eggResponse,
            'attributes',
            [],
        );

        $environment = $this->environment(
            $egg,
            data_get(
                $configuration,
                'environment',
                [],
            ),
        );

        $externalId = (string) data_get(
            $configuration,
            'external_id',
            'astreon-server-'.Str::uuid(),
        );

        $response = $this->client->createServer([
            'external_id' => $externalId,
            'name' => (string) data_get(
                $configuration,
                'name',
                'Serveur Astreon',
            ),
            'description' => (string) data_get(
                $configuration,
                'description',
                'Serveur automatiquement créé par AstreonHeberg.',
            ),
            'user' => $pterodactylUserId,
            'egg' => $eggId,
            'docker_image' => (string) data_get(
                $egg,
                'docker_image',
            ),
            'startup' => (string) data_get(
                $egg,
                'startup',
            ),
            'environment' => $environment,
            'limits' => [
                'memory' => (int) data_get(
                    $configuration,
                    'limits.memory',
                    1024,
                ),
                'swap' => (int) data_get(
                    $configuration,
                    'limits.swap',
                    0,
                ),
                'disk' => (int) data_get(
                    $configuration,
                    'limits.disk',
                    5000,
                ),
                'io' => (int) data_get(
                    $configuration,
                    'limits.io',
                    500,
                ),
                'cpu' => (int) data_get(
                    $configuration,
                    'limits.cpu',
                    100,
                ),
                'threads' => data_get(
                    $configuration,
                    'limits.threads',
                ),
                'oom_disabled' => false,
            ],
            'feature_limits' => [
                'databases' => (int) data_get(
                    $configuration,
                    'feature_limits.databases',
                    0,
                ),
                'allocations' => (int) data_get(
                    $configuration,
                    'feature_limits.allocations',
                    0,
                ),
                'backups' => (int) data_get(
                    $configuration,
                    'feature_limits.backups',
                    1,
                ),
            ],
            'allocation' => [
                'default' => (int) data_get(
                    $allocation,
                    'id',
                ),
            ],
            'start_on_completion' => (bool) data_get(
                $configuration,
                'start_on_completion',
                false,
            ),
            'skip_scripts' => false,
        ]);

        $server = data_get(
    $response,
    'attributes',
    [],
);

return [

    'server' => $response,

    'allocation' => $allocation,

    'identifier' => (string) data_get(
        $server,
        'identifier',
    ),

    'uuid' => (string) data_get(
        $server,
        'uuid',
    ),

    'internal_id' => (int) data_get(
        $server,
        'id',
    ),

    'panel_url' => rtrim(
        config('services.pterodactyl.url'),
        '/',
    ).'/server/'.data_get(
        $server,
        'identifier',
    ),

    'temporary_password' => data_get(
        $pterodactylUser,
        'temporary_password',
    ),

];
    }

    /**
     * @param array<string, mixed> $egg
     * @param array<string, mixed> $overrides
     *
     * @return array<string, string>
     */
    private function environment(
        array $egg,
        array $overrides,
    ): array {
        $variables = data_get(
            $egg,
            'relationships.variables.data',
            [],
        );

        $environment = [];

        foreach ($variables as $variable) {
            $attributes = data_get(
                $variable,
                'attributes',
                [],
            );

            $name = (string) data_get(
                $attributes,
                'env_variable',
            );

            if ($name === '') {
                continue;
            }

            $environment[$name] = (string) (
                $overrides[$name]
                ?? data_get(
                    $attributes,
                    'default_value',
                    '',
                )
            );
        }

        return $environment;
    }
}