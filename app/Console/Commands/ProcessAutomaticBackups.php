<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Service;
use App\Services\Pterodactyl\PterodactylClient;
use Illuminate\Console\Command;
use Throwable;

final class ProcessAutomaticBackups extends Command
{
    protected $signature = 'astreon:automatic-backups {--dry-run}';
    protected $description = 'Crée les sauvegardes Pterodactyl automatiques arrivées à échéance.';

    public function handle(PterodactylClient $client): int
    {
        Service::query()
            ->where('backup_enabled', true)
            ->where(function ($query): void {
                $query->whereNull('next_backup_at')->orWhere('next_backup_at', '<=', now());
            })
            ->whereNull('cancelled_at')
            ->chunkById(50, function ($services) use ($client): void {
                foreach ($services as $service) {
                    $identifier = (string) data_get($service->configuration, 'pterodactyl.identifier');
                    if ($identifier === '') {
                        $this->warn($service->reference.' : identifiant absent');
                        continue;
                    }

                    if ($this->option('dry-run')) {
                        $this->line('Sauvegarde : '.$service->reference);
                        continue;
                    }

                    try {
                        $client->createServerBackup($identifier, 'Auto '.$service->reference.' '.now()->format('d-m-Y H:i'));
                        $service->forceFill([
                            'last_backup_at' => now(),
                            'next_backup_at' => now()->addHours(max(1, (int) $service->backup_frequency_hours)),
                        ])->save();
                        $this->info($service->reference.' : sauvegarde lancée');
                    } catch (Throwable $exception) {
                        report($exception);
                        $this->error($service->reference.' : '.$exception->getMessage());
                    }
                }
            });

        return self::SUCCESS;
    }
}
