<?php

namespace App\Services\Pterodactyl;

use RuntimeException;

class PterodactylAllocationService
{
    public function __construct(
        private readonly PterodactylClient $client,
    ) {
    }

    /**
 * @param array<int, int> $preferredPorts
 *
 * @return array<string, mixed>
 */
public function findAvailable(
    int $nodeId,
    array $preferredPorts = [],
): array {
    $response = $this->client->listAllocations(
        $nodeId,
        true,
    );

    $allocations = data_get(
        $response,
        'data',
        [],
    );

    if ($preferredPorts !== []) {
        foreach ($preferredPorts as $port) {
            foreach ($allocations as $allocation) {
                $attributes = data_get(
                    $allocation,
                    'attributes',
                    [],
                );

                if (
                    (int) data_get($attributes, 'port')
                    === (int) $port
                ) {
                    return $attributes;
                }
            }
        }

        throw new RuntimeException(
            'Aucune allocation libre trouvée pour les ports : '
            .implode(', ', $preferredPorts)
            .". Node : {$nodeId}.",
        );
    }

    $firstAllocation = data_get(
        $allocations,
        '0.attributes',
    );

    if (! is_array($firstAllocation)) {
        throw new RuntimeException(
            "Aucune allocation libre sur le node {$nodeId}.",
        );
    }

    return $firstAllocation;
}
}