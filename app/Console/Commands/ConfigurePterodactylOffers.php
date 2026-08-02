<?php

namespace App\Console\Commands;

use App\Models\ProductPlan;
use Illuminate\Console\Command;
use RuntimeException;

class ConfigurePterodactylOffers extends Command
{
    protected $signature = 'pterodactyl:configure-offers';

    protected $description =
        'Configure les offres Astreon pour le provisionnement Pterodactyl';

    public function handle(): int
    {
        try {
            $this->configureFiveM();
            $this->configureArkEvolved();
            $this->configureArkAscended();
            $this->configurePalworld();
            $this->configureMinecraftJava();
            $this->configureMinecraftBedrock();

            $this->newLine();
            $this->info(
                'Toutes les offres Pterodactyl ont été configurées.',
            );

            $this->displaySummary();

            return self::SUCCESS;
        } catch (\Throwable $exception) {
            $this->error(
                'Configuration impossible : '
                .$exception->getMessage(),
            );

            return self::FAILURE;
        }
    }

    private function configureFiveM(): void
    {
        $this->configurePlans(
            planIds: [1, 2, 3, 4],
            nodeId: 1,
            nestId: 6,
            eggId: 18,
            preferredPorts: range(30120, 30140),
            environmentFactory: function (
                ProductPlan $plan,
            ): array {
                return [
                    'FIVEM_VERSION' => 'recommended',
                    'DOWNLOAD_URL' => '',
                    'MAX_PLAYERS' => (string) max(
                        1,
                        (int) $plan->player_slots,
                    ),
                    'SERVER_HOSTNAME' =>
                        'Serveur FiveM Astreon',
                    'TXHOST_GAME_NAME' => 'fivem',
                    'TXADMIN_ENABLE' => '0',

                    /*
                     * La clé Cfx.re devra être renseignée avant
                     * le premier démarrage du serveur.
                     */
                    'FIVEM_LICENSE' => (string) data_get(
    $plan->provisioning_config,
    'environment.FIVEM_LICENSE',
    '',
),
                ];
            },
        );

        $this->line('✓ FiveM configuré');
    }

    private function configureArkEvolved(): void
    {
        $this->configurePlans(
            planIds: [5, 6, 7],
            nodeId: 1,
            nestId: 5,
            eggId: 23,
            preferredPorts: range(7777, 7786),
            environmentFactory: function (
                ProductPlan $plan,
            ): array {
                return [
                    'SESSION_NAME' =>
                        'Serveur ARK Astreon',
                    'SERVER_MAP' => 'TheIsland',
                    'MAX_PLAYERS' => (string) max(
                        1,
                        (int) $plan->player_slots,
                    ),
                    'SERVER_PASSWORD' => '',
                    'ADMIN_PASSWORD' => '__GENERATE__',
                    'ENABLE_RCON' => 'true',
                ];
            },
        );

        $this->line('✓ ARK Survival Evolved configuré');
    }

    private function configureArkAscended(): void
    {
        $this->configurePlans(
            planIds: [8],
            nodeId: 1,
            nestId: 5,
            eggId: 22,
            preferredPorts: range(7787, 7796),
            environmentFactory: function (
                ProductPlan $plan,
            ): array {
                return [
                    'SESSION_NAME' =>
                        'Serveur ARK Ascended Astreon',
                    'SERVER_MAP' => 'TheIsland_WP',
                    'MAX_PLAYERS' => (string) max(
                        1,
                        (int) $plan->player_slots,
                    ),
                    'SERVER_PASSWORD' => '',
                    'ADMIN_PASSWORD' => '__GENERATE__',
                    'ENABLE_RCON' => 'true',
                ];
            },
        );

        $this->line('✓ ARK Survival Ascended configuré');
    }

    private function configurePalworld(): void
    {
        $this->configurePlans(
            planIds: [9, 10, 11, 12],
            nodeId: 1,
            nestId: 5,
            eggId: 17,
            preferredPorts: range(8211, 8220),
            environmentFactory: function (
                ProductPlan $plan,
            ): array {
                return [
                    'SRCDS_APPID' => '2394010',
                    'AUTO_UPDATE' => '1',
                    'MAX_PLAYERS' => (string) min(
                        32,
                        max(
                            1,
                            (int) $plan->player_slots,
                        ),
                    ),
                    'ADMIN_PASSWORD' => '__GENERATE__',
                    'PUBLIC_IP' => '164.132.198.194',
                    'SERVER_NAME' =>
                        'Serveur Palworld Astreon',
                    'SERVER_PASSWORD' => '',
                    'RCON_PORT' => '25575',
                    'RCON_ENABLE' => 'True',
                    'SERVER_DESCRIPTION' =>
                        'Serveur Palworld hébergé par AstreonHeberg',
                    'ALLOW_CONNECT_PLATFORM' => 'Steam',
                ];
            },
        );

        $this->line('✓ Palworld configuré');
    }

    private function configureMinecraftJava(): void
    {
        $this->configurePlans(
            planIds: [13, 14, 15, 16],
            nodeId: 1,
            nestId: 1,
            eggId: 2,
            preferredPorts: range(25565, 25574),
            environmentFactory: function (
                ProductPlan $plan,
            ): array {
                return [
                    /*
                     * Les autres variables utilisent les valeurs
                     * par défaut de l’Egg Paper.
                     */
                    'MAX_PLAYERS' => (string) max(
                        1,
                        (int) $plan->player_slots,
                    ),
                ];
            },
        );

        $this->line('✓ Minecraft Java configuré');
    }

    private function configureMinecraftBedrock(): void
    {
        $this->configurePlans(
            planIds: [17, 18, 19, 20],
            nodeId: 1,
            nestId: 1,
            eggId: 15,
            preferredPorts: range(19132, 19150),
            environmentFactory: function (
                ProductPlan $plan,
            ): array {
                return [
                    /*
                     * Les valeurs absentes seront complétées
                     * automatiquement depuis l’Egg Bedrock.
                     */
                    'MAX_PLAYERS' => (string) max(
                        1,
                        (int) $plan->player_slots,
                    ),
                ];
            },
        );

        $this->line('✓ Minecraft Bedrock configuré');
    }

    /**
     * @param array<int, int> $planIds
     * @param array<int, int> $preferredPorts
     * @param callable(ProductPlan): array<string, string>
     *     $environmentFactory
     */
    private function configurePlans(
        array $planIds,
        int $nodeId,
        int $nestId,
        int $eggId,
        array $preferredPorts,
        callable $environmentFactory,
    ): void {
        $plans = ProductPlan::query()
            ->whereIn('id', $planIds)
            ->get();

        if ($plans->count() !== count($planIds)) {
            $foundIds = $plans
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->all();

            $missingIds = array_values(
                array_diff($planIds, $foundIds),
            );

            throw new RuntimeException(
                'Plans introuvables : '
                .implode(', ', $missingIds),
            );
        }

        foreach ($plans as $plan) {
            $config = $plan->provisioning_config ?? [];

            if (! is_array($config)) {
                $config = [];
            }

            /*
             * La RAM, le stockage, le CPU, les bases et les
             * sauvegardes sont lus directement depuis l’offre.
             */
            unset(
                $config['limits'],
                $config['feature_limits'],
            );

            $config['driver'] = 'pterodactyl';
            $config['node_id'] = $nodeId;
            $config['nest_id'] = $nestId;
            $config['egg_id'] = $eggId;

            $config['preferred_ports'] =
                $preferredPorts;

            $config['environment'] =
                $environmentFactory($plan);

            $config['start_on_completion'] = false;

            $plan->update([
                'provisioning_config' => $config,

                /*
                 * Maintient également le snapshot commercial
                 * cohérent avec les champs principaux du plan.
                 */
                'specifications' => [
                    'ram_mb' => (int) $plan->ram_mb,
                    'disk_gb' => (int) $plan->disk_gb,
                    'cpu_percent' =>
                        (int) $plan->cpu_percent,
                    'player_slots' =>
                        (int) $plan->player_slots,
                    'databases' =>
                        (int) $plan->databases_limit,
                    'backups' =>
                        (int) $plan->backups_limit,
                    'sftp' => true,
                    'console' => true,
                ],
            ]);
        }
    }

    private function displaySummary(): void
    {
        $rows = ProductPlan::query()
            ->whereIn('id', range(1, 20))
            ->orderBy('id')
            ->get()
            ->map(function (
                ProductPlan $plan,
            ): array {
                $config =
                    $plan->provisioning_config ?? [];

                return [
                    $plan->id,
                    $plan->name,
                    data_get($config, 'node_id', '—'),
                    data_get($config, 'nest_id', '—'),
                    data_get($config, 'egg_id', '—'),
                    $this->formatRam(
                        (int) $plan->ram_mb,
                    ),
                    "{$plan->disk_gb} Go",
                    "{$plan->cpu_percent} %",
                ];
            })
            ->all();

        $this->newLine();

        $this->table(
            [
                'Plan',
                'Nom',
                'Node',
                'Nest',
                'Egg',
                'RAM',
                'Disque',
                'CPU',
            ],
            $rows,
        );
    }

    private function formatRam(int $ramMb): string
    {
        if ($ramMb < 1) {
            return '—';
        }

        $ramGb = $ramMb / 1024;

        return number_format(
            $ramGb,
            $ramGb === floor($ramGb) ? 0 : 1,
            ',',
            '',
        ).' Go';
    }
}