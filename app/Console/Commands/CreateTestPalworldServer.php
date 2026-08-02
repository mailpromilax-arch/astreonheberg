<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\Pterodactyl\PterodactylServerService;
use Illuminate\Console\Command;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Str;
use Throwable;

class CreateTestPalworldServer extends Command
{
    protected $signature = 'pterodactyl:create-palworld-test
                            {--user=1 : Identifiant Laravel du propriétaire}
                            {--port=8212 : Port Pterodactyl préféré}';

    protected $description =
        'Crée un serveur Palworld de test depuis Laravel';

    public function handle(
        PterodactylServerService $servers,
    ): int {
        $user = User::query()->find(
            (int) $this->option('user'),
        );

        if (! $user) {
            $this->error(
                'Utilisateur Laravel introuvable.',
            );

            return self::FAILURE;
        }

        $adminPassword = Str::random(16);

        try {
            $result = $servers->create(
                $user,
                [
                    'external_id' => 'astreon-palworld-test-'
                        .now()->format('YmdHis'),
                    'name' => 'Astreon Palworld API Test',
                    'description' =>
                        'Serveur Palworld créé depuis Laravel.',
                    'node_id' => 1,
                    'nest_id' => 5,
                    'egg_id' => 17,
                    'preferred_ports' => [
                        (int) $this->option('port'),
                    ],
                    'limits' => [
                        'memory' => 2600,
                        'swap' => 0,
                        'disk' => 10000,
                        'io' => 500,
                        'cpu' => 150,
                        'threads' => null,
                    ],
                    'feature_limits' => [
                        'databases' => 0,
                        'allocations' => 0,
                        'backups' => 1,
                    ],
                    'environment' => [
                        'SRCDS_APPID' => '2394010',
                        'AUTO_UPDATE' => '1',
                        'MAX_PLAYERS' => '4',
                        'ADMIN_PASSWORD' => $adminPassword,
                        'PUBLIC_IP' => '164.132.198.194',
                        'SERVER_NAME' =>
                            'Astreon Palworld API Test',
                        'SERVER_PASSWORD' => '',
                        'RCON_PORT' => '25575',
                        'RCON_ENABLE' => 'True',
                        'SERVER_DESCRIPTION' =>
                            'Serveur de test AstreonHeberg',
                        'ALLOW_CONNECT_PLATFORM' => 'Steam',
                    ],
                    'start_on_completion' => false,
                ],
            );

            $server = data_get(
                $result,
                'server.attributes',
                [],
            );

            $allocation = data_get(
                $result,
                'allocation',
                [],
            );

            $this->newLine();
            $this->info(
                'Serveur Palworld créé avec succès.',
            );

            $this->table(
                ['Information', 'Valeur'],
                [
                    [
                        'ID',
                        data_get($server, 'id'),
                    ],
                    [
                        'UUID',
                        data_get($server, 'uuid'),
                    ],
                    [
                        'Nom',
                        data_get($server, 'name'),
                    ],
                    [
                        'IP',
                        data_get($allocation, 'ip'),
                    ],
                    [
                        'Port',
                        data_get($allocation, 'port'),
                    ],
                    [
                        'Statut',
                        'Installation en cours',
                    ],
                ],
            );

            $this->warn(
                'Le mot de passe administrateur Palworld '
                .'a été généré et n’est volontairement pas affiché.',
            );

            if (
                filled(
                    data_get(
                        $result,
                        'temporary_password',
                    ),
                )
            ) {
                $this->warn(
                    'Un nouveau compte Pterodactyl a également été créé. '
                    .'Son mot de passe temporaire devra être transmis '
                    .'de façon sécurisée.',
                );
            }

            return self::SUCCESS;
        } catch (RequestException $exception) {
    $response = $exception->response;

    $this->error('Erreur API Pterodactyl');

    $this->line(
        'Méthode : '
        .$response->effectiveUri()
    );

    $this->line(
        'Statut HTTP : '
        .$response->status()
    );

    $this->line(
        'Réponse : '
        .$response->body()
    );

    return self::FAILURE;
} catch (Throwable $exception) {
            $this->error(
                'Création impossible : '
                .$exception->getMessage(),
            );

            return self::FAILURE;
        }
    }
}