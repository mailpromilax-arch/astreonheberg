<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\Pterodactyl\PterodactylInfrastructureSync;
use Illuminate\Console\Command;
use Throwable;

final class SyncPterodactylInfrastructure extends Command
{
    protected $signature = 'pterodactyl:sync-infrastructure';

    protected $description = 'Synchronise locations, nœuds et serveurs depuis Pterodactyl';

    public function handle(
        PterodactylInfrastructureSync $sync,
    ): int {
        $this->info('Synchronisation Pterodactyl en cours...');

        try {
            $result = $sync->sync();
        } catch (Throwable $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        $this->table(
            ['Locations', 'Nœuds', 'Serveurs', 'Clients liés', 'Non liés'],
            [[
                $result['locations'],
                $result['nodes'],
                $result['servers'],
                $result['linked_users'],
                $result['unlinked_users'],
            ]],
        );

        $this->info('Synchronisation terminée.');

        return self::SUCCESS;
    }
}
