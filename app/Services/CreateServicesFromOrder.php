<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductPlan;
use App\Models\Service;
use App\Services\Pterodactyl\PterodactylServerService;
use Illuminate\Support\Str;
use Throwable;

class CreateServicesFromOrder
{
    public function __construct(
        private readonly PterodactylServerService $pterodactyl,
    ) {
    }

    public function handle(Order $order): void
    {
        $order->loadMissing([
    'user',
    'items.productPlan.product',
]);

        foreach ($order->items as $item) {
            $this->createForItem($order, $item);
        }
    }

    private function createForItem(
        Order $order,
        OrderItem $item,
    ): void {
        $plan = $item->productPlan;

        $snapshotConfig = data_get(
    $item->plan_snapshot,
    'provisioning_config',
    [],
);

$currentPlanConfig = $plan?->provisioning_config ?? [];

if (! is_array($snapshotConfig)) {
    $snapshotConfig = [];
}

if (! is_array($currentPlanConfig)) {
    $currentPlanConfig = [];
}

/*
 * Le snapshot garde les réglages achetés, mais les identifiants
 * techniques invalides ou absents sont récupérés depuis le plan actuel.
 */
$provisioningConfig = array_replace_recursive(
    $currentPlanConfig,
    $snapshotConfig,
);

foreach (['node_id', 'nest_id', 'egg_id'] as $technicalKey) {
    if ((int) data_get($provisioningConfig, $technicalKey) < 1) {
        $provisioningConfig[$technicalKey] = (int) data_get(
            $currentPlanConfig,
            $technicalKey,
        );
    }
}

/*
 * Les allocations du plan actuel sont utilisées si le snapshot
 * n’en contient aucune de valide.
 */
$preferredPorts = array_filter(
    array_map(
        'intval',
        data_get(
            $provisioningConfig,
            'preferred_ports',
            [],
        ),
    ),
);

if ($preferredPorts === []) {
    $provisioningConfig['preferred_ports'] = data_get(
        $currentPlanConfig,
        'preferred_ports',
        [],
    );
}

        $provider = (string) data_get(
            $provisioningConfig,
            'driver',
            'manual',
        );

        $service = Service::updateOrCreate(
            [
                'order_item_id' => $item->id,
            ],
            [
                'user_id' => $order->user_id,
                'order_id' => $order->id,
                'product_plan_id' => $item->product_plan_id,
                'reference' => $this->reference($item),
                'name' => $item->product_name
                    .' — '
                    .$item->plan_name,
                'status' => 'provisioning',
                'provider' => $provider,
                'expires_at' => now()->addMonth(),

                'configuration' => [
                    'quantity' => $item->quantity,
                    'billing_cycle' => $item->billing_cycle,
                    'sku' => $item->sku,
                    'plan_snapshot' => $item->plan_snapshot,
                    'provisioning_config' => $provisioningConfig,
                ],

                'metadata' => [
                    'created_from_order' => $order->reference,
                    'automatic_creation' => true,
                ],
            ],
        );

        if ($provider !== 'pterodactyl') {
            return;
        }

        /*
         * Évite de créer deux serveurs si Stripe rappelle plusieurs
         * fois le traitement de la même commande.
         */
        if (filled($service->external_id)) {
            return;
        }

        if (! $plan instanceof ProductPlan) {
            $service->update([
                'status' => 'failed',

                'metadata' => array_merge(
                    $service->metadata ?? [],
                    [
                        'provisioning_failed_at' =>
                            now()->toIso8601String(),

                        'provisioning_error' =>
                            'Le plan associé à la commande est introuvable.',
                    ],
                ),
            ]);

            return;
        }

        /*
         * Les ressources proviennent du snapshot de l’offre payée.
         * Ainsi, une modification ultérieure du plan ne modifiera pas
         * les ressources correspondant à l’ancienne commande.
         */
        $resources = $this->purchasedResources(
            $item,
            $plan,
        );

        $this->provisionPterodactyl(
            $order,
            $service,
            $provisioningConfig,
            $resources,
        );
    }

    /**
     * @param array<string, mixed> $config
     * @param array{
     *     memory_mb: int,
     *     disk_gb: int,
     *     disk_mb: int,
     *     cpu_percent: int,
     *     player_slots: int,
     *     databases: int,
     *     backups: int
     * } $resources
     */
    private function provisionPterodactyl(
        Order $order,
        Service $service,
        array $config,
        array $resources,
    ): void {
        $environment = $this->prepareEnvironment(
            data_get($config, 'environment', []),
        );

        /*
         * Les Eggs Palworld, FiveM et plusieurs Eggs de jeux
         * utilisent MAX_PLAYERS.
         */
        if (array_key_exists('MAX_PLAYERS', $environment)) {
            $environment['MAX_PLAYERS'] = (string) $resources[
                'player_slots'
            ];
        }

        try {
            $result = $this->pterodactyl->create(
                $order->user,
                [
                    'external_id' =>
                        "astreon-service-{$service->id}",

                    'name' => $service->name,

                    'description' =>
                        "Commande {$order->reference}"
                        ." — {$service->reference}",

                    'node_id' => (int) data_get(
                        $config,
                        'node_id',
                    ),

                    'nest_id' => (int) data_get(
                        $config,
                        'nest_id',
                    ),

                    'egg_id' => (int) data_get(
                        $config,
                        'egg_id',
                    ),

                    'preferred_ports' => array_map(
                        'intval',
                        data_get(
                            $config,
                            'preferred_ports',
                            [],
                        ),
                    ),

                    /*
                     * Les ressources viennent exclusivement
                     * de l’offre réellement achetée.
                     */
                    'limits' => [
                        'memory' => $resources['memory_mb'],
                        'swap' => 0,
                        'disk' => $resources['disk_mb'],
                        'io' => 500,
                        'cpu' => $resources['cpu_percent'],
                        'threads' => null,
                    ],

                    'feature_limits' => [
                        'databases' => $resources['databases'],
                        'allocations' => 0,
                        'backups' => $resources['backups'],
                    ],

                    'environment' => $environment,

                    'start_on_completion' => (bool) data_get(
                        $config,
                        'start_on_completion',
                        false,
                    ),
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

            $identifier = (string) data_get(
                $server,
                'identifier',
            );

            $panelUrl = rtrim(
                (string) config(
                    'services.pterodactyl.url',
                ),
                '/',
            );

            $service->update([
                /*
                 * Pterodactyl a accepté et créé le serveur.
                 * Le service est donc considéré comme livré et actif.
                 */
                'status' => 'active',
                'activated_at' => $service->activated_at ?? now(),
                'suspended_at' => null,

                /*
                 * ID numérique du serveur Pterodactyl.
                 */
                'external_id' => (string) data_get(
                    $server,
                    'id',
                ),

                'external_url' => $identifier !== ''
                    ? "{$panelUrl}/server/{$identifier}"
                    : $panelUrl,

                /*
                 * La colonne credentials doit être LONGTEXT
                 * avec le cast encrypted:array dans Service.
                 */
                'credentials' => array_filter([
                    'game_admin_password' =>
                        $environment['ADMIN_PASSWORD'] ?? null,

                    'pterodactyl_temporary_password' =>
                        data_get(
                            $result,
                            'temporary_password',
                        ),
                ]),

                'configuration' => array_merge(
                    $service->configuration ?? [],
                    [
                        /*
                         * Ressources exactes livrées.
                         */
                        'delivered_resources' => [
                            'memory_mb' =>
                                $resources['memory_mb'],

                            'memory_gb' =>
                                $resources['memory_mb'] / 1024,

                            'disk_mb' =>
                                $resources['disk_mb'],

                            'disk_gb' =>
                                $resources['disk_gb'],

                            'cpu_percent' =>
                                $resources['cpu_percent'],

                            'player_slots' =>
                                $resources['player_slots'],

                            'databases' =>
                                $resources['databases'],

                            'backups' =>
                                $resources['backups'],
                        ],

                        'allocation' => [
                            'id' => data_get(
                                $allocation,
                                'id',
                            ),

                            'ip' => data_get(
                                $allocation,
                                'ip',
                            ),

                            'alias' => data_get(
                                $allocation,
                                'alias',
                            ),

                            'port' => data_get(
                                $allocation,
                                'port',
                            ),
                        ],

                        'pterodactyl' => [
                            'server_id' => data_get(
                                $server,
                                'id',
                            ),

                            'uuid' => data_get(
                                $server,
                                'uuid',
                            ),

                            'identifier' => $identifier,

                            'node_id' => data_get(
                                $server,
                                'node',
                            ),

                            'egg_id' => data_get(
                                $server,
                                'egg',
                            ),
                        ],
                    ],
                ),

                'metadata' => array_merge(
                    $service->metadata ?? [],
                    [
                        'pterodactyl_created_at' =>
                            now()->toIso8601String(),

                        'pterodactyl_status' =>
                            data_get(
                                $server,
                                'status',
                            ) ?? 'installing',
                    ],
                ),
            ]);

            activity()
                ->causedBy($order->user)
                ->performedOn($service)
                ->event('service_activated')
                ->withProperties([
                    'provider' => 'pterodactyl',
                    'server_id' => data_get(
                        $server,
                        'id',
                    ),
                    'uuid' => data_get(
                        $server,
                        'uuid',
                    ),
                    'allocation' => $allocation,
                    'delivered_resources' => $resources,
                ])
                ->log(
                    "Service Pterodactyl activé "
                    ."pour {$service->reference}",
                );
        } catch (Throwable $exception) {
            /*
             * Recharge le modèle pour ne pas renvoyer dans la requête
             * d’éventuelles valeurs qui ont échoué précédemment.
             */
            $service->refresh();

            $service->update([
                'status' => 'failed',

                'metadata' => array_merge(
                    $service->metadata ?? [],
                    [
                        'provisioning_failed_at' =>
                            now()->toIso8601String(),

                        'provisioning_error' =>
                            $exception->getMessage(),
                    ],
                ),
            ]);

            report($exception);

            activity()
                ->causedBy($order->user)
                ->performedOn($service)
                ->event('service_provisioning_failed')
                ->withProperties([
                    'provider' => 'pterodactyl',
                    'error' => $exception->getMessage(),
                ])
                ->log(
                    "Échec du provisionnement "
                    ."de {$service->reference}",
                );
        }
    }

    /**
     * Récupère les caractéristiques exactes de l’offre payée.
     *
     * Le snapshot de la commande est prioritaire.
     * Le plan actuel est utilisé uniquement en solution de secours.
     *
     * @return array{
     *     memory_mb: int,
     *     disk_gb: int,
     *     disk_mb: int,
     *     cpu_percent: int,
     *     player_slots: int,
     *     databases: int,
     *     backups: int
     * }
     */
    private function purchasedResources(
        OrderItem $item,
        ProductPlan $plan,
    ): array {
        $memoryMb = max(
            512,
            (int) data_get(
                $item->plan_snapshot,
                'specifications.ram_mb',
                $plan->ram_mb,
            ),
        );

        $diskGb = max(
            1,
            (int) data_get(
                $item->plan_snapshot,
                'specifications.disk_gb',
                $plan->disk_gb,
            ),
        );

        $cpuPercent = max(
            0,
            (int) data_get(
                $item->plan_snapshot,
                'specifications.cpu_percent',
                $plan->cpu_percent,
            ),
        );

        $playerSlots = max(
            1,
            (int) data_get(
                $item->plan_snapshot,
                'specifications.player_slots',
                $plan->player_slots,
            ),
        );

        $databases = max(
            0,
            (int) data_get(
                $item->plan_snapshot,
                'specifications.databases',
                $plan->databases_limit,
            ),
        );

        $backups = max(
            0,
            (int) data_get(
                $item->plan_snapshot,
                'specifications.backups',
                $plan->backups_limit,
            ),
        );

        return [
            'memory_mb' => $memoryMb,
            'disk_gb' => $diskGb,

            /*
             * Pterodactyl attend le stockage en mégaoctets.
             * 25 Go devient donc 25 600 Mo.
             */
            'disk_mb' => $diskGb * 1024,

            'cpu_percent' => $cpuPercent,
            'player_slots' => $playerSlots,
            'databases' => $databases,
            'backups' => $backups,
        ];
    }

    /**
     * @param mixed $environment
     *
     * @return array<string, string>
     */
    private function prepareEnvironment(
        mixed $environment,
    ): array {
        if (! is_array($environment)) {
            return [];
        }

        return collect($environment)
            ->mapWithKeys(function (
                mixed $value,
                string $key,
            ): array {
                if ($value === '__GENERATE__') {
                    return [
                        $key => Str::random(20),
                    ];
                }

                return [
                    $key => (string) $value,
                ];
            })
            ->all();
    }

    private function reference(OrderItem $item): string
    {
        $existing = Service::query()
            ->where('order_item_id', $item->id)
            ->value('reference');

        if ($existing) {
            return $existing;
        }

        do {
            $reference = 'SRV-'
                .now()->format('Ymd')
                .'-'
                .Str::upper(Str::random(8));
        } while (
            Service::query()
                ->where('reference', $reference)
                ->exists()
        );

        return $reference;
    }
}