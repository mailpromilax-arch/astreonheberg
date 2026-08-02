<?php

namespace App\Console\Commands;

use App\Services\Pterodactyl\PterodactylClient;
use Illuminate\Console\Command;
use Throwable;

class InspectPterodactyl extends Command
{
    protected $signature = 'pterodactyl:inspect
                            {--node= : Identifiant du node à inspecter}';

    protected $description =
        'Affiche les nodes, allocations disponibles, nests et eggs';

    public function handle(
        PterodactylClient $client,
    ): int {
        try {
            $this->displayNodes($client);
            $this->displayNests($client);

            $nodeId = $this->option('node');

            if ($nodeId !== null) {
                $this->displayAllocations(
                    $client,
                    (int) $nodeId,
                );
            }

            return self::SUCCESS;
        } catch (Throwable $exception) {
            $this->error(
                'Erreur Pterodactyl : '
                .$exception->getMessage(),
            );

            return self::FAILURE;
        }
    }

    private function displayNodes(
        PterodactylClient $client,
    ): void {
        $response = $client->listNodes();

        $rows = collect(
            data_get($response, 'data', []),
        )->map(function (array $node): array {
            $attributes = data_get(
                $node,
                'attributes',
                [],
            );

            return [
                data_get($attributes, 'id'),
                data_get($attributes, 'name'),
                data_get($attributes, 'fqdn'),
                data_get($attributes, 'memory'),
                data_get($attributes, 'disk'),
            ];
        })->all();

        $this->newLine();
        $this->info('Nodes');

        $this->table(
            ['ID', 'Nom', 'FQDN', 'RAM', 'Disque'],
            $rows,
        );
    }

    private function displayNests(
        PterodactylClient $client,
    ): void {
        $response = $client->listNests();

        $nests = data_get($response, 'data', []);

        foreach ($nests as $nest) {
            $attributes = data_get(
                $nest,
                'attributes',
                [],
            );

            $nestId = (int) data_get(
                $attributes,
                'id',
            );

            $nestDetails = $client->getNest(
                $nestId,
                true,
            );

            $nestAttributes = data_get(
                $nestDetails,
                'attributes',
                [],
            );

            $this->newLine();
            $this->info(
                sprintf(
                    'Nest %d — %s',
                    $nestId,
                    data_get(
                        $nestAttributes,
                        'name',
                        'Sans nom',
                    ),
                ),
            );

            $eggRows = collect(
                data_get(
                    $nestDetails,
                    'attributes.relationships.eggs.data',
                    [],
                ),
            )->map(function (array $egg): array {
                $attributes = data_get(
                    $egg,
                    'attributes',
                    [],
                );

                return [
                    data_get($attributes, 'id'),
                    data_get($attributes, 'name'),
                ];
            })->all();

            $this->table(
                ['Egg ID', 'Nom'],
                $eggRows,
            );
        }
    }

    private function displayAllocations(
        PterodactylClient $client,
        int $nodeId,
    ): void {
        $response = $client->listAllocations(
            $nodeId,
            true,
        );

        $rows = collect(
            data_get($response, 'data', []),
        )->map(function (array $allocation): array {
            $attributes = data_get(
                $allocation,
                'attributes',
                [],
            );

            return [
                data_get($attributes, 'id'),
                data_get($attributes, 'ip'),
                data_get($attributes, 'alias'),
                data_get($attributes, 'port'),
                data_get($attributes, 'assigned')
                    ? 'Oui'
                    : 'Non',
            ];
        })->all();

        $this->newLine();
        $this->info(
            "Allocations libres du node {$nodeId}",
        );

        $this->table(
            ['ID', 'IP', 'Alias', 'Port', 'Assignée'],
            $rows,
        );
    }
}