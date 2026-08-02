<?php

namespace App\Console\Commands;

use App\Services\Pterodactyl\PterodactylClient;
use Illuminate\Console\Command;
use Throwable;

class TestPterodactylConnection extends Command
{
    protected $signature = 'pterodactyl:test';

    protected $description = 'Teste la connexion à l’Application API Pterodactyl';

    public function handle(
        PterodactylClient $client,
    ): int {
        try {
            $response = $client->testConnection();

            $count = count(
                data_get($response, 'data', []),
            );

            $this->info(
                "Connexion Pterodactyl réussie : {$count} node(s) détecté(s).",
            );

            return self::SUCCESS;
        } catch (Throwable $exception) {
            $this->error(
                'Connexion Pterodactyl impossible : '
                .$exception->getMessage(),
            );

            return self::FAILURE;
        }
    }
}