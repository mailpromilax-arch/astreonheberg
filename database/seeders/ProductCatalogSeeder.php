<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductPlan;
use Illuminate\Database\Seeder;

class ProductCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $catalog = [
            [
                'category' => [
                    'name' => 'Serveurs Gaming',
                    'slug' => 'gaming',
                    'description' => 'Serveurs de jeux performants et administrables avec Pterodactyl.',
                    'icon' => 'gamepad',
                    'sort_order' => 1,
                ],
                'products' => [
                    [
                        'name' => 'FiveM',
                        'slug' => 'fivem',
                        'description' => 'Hébergement FiveM pour serveurs RP et communautés.',
                        'plans' => [
                            ['Nova', 'GAME-FIVEM-NOVA', 599, 4096, 20, 150, 32],
                            ['Pulsar', 'GAME-FIVEM-PULSAR', 1099, 8192, 40, 250, 64],
                            ['Galaxy', 'GAME-FIVEM-GALAXY', 1599, 12288, 60, 350, 128],
                            ['Nebula', 'GAME-FIVEM-NEBULA', 2199, 16384, 90, 450, 200],
                        ],
                    ],
                    [
                        'name' => 'ARK',
                        'slug' => 'ark',
                        'description' => 'Serveurs ARK adaptés aux cartes, mods et grandes communautés.',
                        'plans' => [
                            ['Survivor', 'GAME-ARK-SURVIVOR', 899, 6144, 30, 180, 10],
                            ['Explorer', 'GAME-ARK-EXPLORER', 1399, 10240, 50, 280, 30],
                            ['Conqueror', 'GAME-ARK-CONQUEROR', 2099, 16384, 80, 380, 70],
                            ['Ascended', 'GAME-ARK-ASCENDED', 2999, 24576, 120, 500, 100],
                        ],
                    ],
                    [
                        'name' => 'Palworld',
                        'slug' => 'palworld',
                        'description' => 'Serveurs Palworld rapides pour jouer entre amis ou en communauté.',
                        'plans' => [
                            ['Scout', 'GAME-PAL-SCOUT', 799, 6144, 25, 180, 8],
                            ['Tamer', 'GAME-PAL-TAMER', 1299, 10240, 40, 280, 16],
                            ['Master', 'GAME-PAL-MASTER', 1899, 16384, 60, 380, 24],
                            ['Legend', 'GAME-PAL-LEGEND', 2699, 24576, 90, 500, 32],
                        ],
                    ],
                    [
                        'name' => 'Minecraft Java',
                        'slug' => 'minecraft-java',
                        'description' => 'Vanilla, Paper, Forge, Fabric, plugins et modpacks.',
                        'plans' => [
                            ['Coal', 'GAME-MCJ-COAL', 349, 2048, 15, 100, 10],
                            ['Iron', 'GAME-MCJ-IRON', 599, 4096, 25, 180, 30],
                            ['Diamond', 'GAME-MCJ-DIAMOND', 1099, 8192, 45, 280, 70],
                            ['Netherite', 'GAME-MCJ-NETHERITE', 1599, 12288, 70, 380, 120],
                        ],
                    ],
                    [
                        'name' => 'Minecraft Bedrock',
                        'slug' => 'minecraft-bedrock',
                        'description' => 'Serveurs Minecraft Bedrock pour mobiles, consoles et PC.',
                        'plans' => [
                            ['Copper', 'GAME-MCB-COPPER', 299, 2048, 15, 100, 10],
                            ['Amethyst', 'GAME-MCB-AMETHYST', 499, 4096, 25, 160, 25],
                            ['Emerald', 'GAME-MCB-EMERALD', 799, 6144, 40, 240, 50],
                            ['Beacon', 'GAME-MCB-BEACON', 1199, 10240, 60, 340, 100],
                        ],
                    ],
                ],
            ],
            [
                'category' => [
                    'name' => 'VPS Cloud',
                    'slug' => 'vps',
                    'description' => 'VPS Linux et Windows avec accès administrateur.',
                    'icon' => 'server',
                    'sort_order' => 2,
                ],
                'products' => [
                    [
                        'name' => 'VPS',
                        'slug' => 'vps-cloud',
                        'description' => 'Machines virtuelles NVMe pour applications, bots et services.',
                        'plans' => [
                            ['VPS One', 'VPS-ONE', 499, 2048, 25, 100, null, 1],
                            ['VPS Start', 'VPS-START', 899, 4096, 50, 200, null, 2],
                            ['VPS Pro', 'VPS-PRO', 1599, 8192, 90, 400, null, 4],
                            ['VPS Ultra', 'VPS-ULTRA', 2799, 16384, 150, 600, null, 6],
                        ],
                    ],
                ],
            ],
            [
                'category' => [
                    'name' => 'Hébergement Web',
                    'slug' => 'web',
                    'description' => 'Hébergements Web rapides avec PHP, bases de données et SSL.',
                    'icon' => 'globe',
                    'sort_order' => 3,
                ],
                'products' => [
                    [
                        'name' => 'Hébergement Web',
                        'slug' => 'hebergement-web',
                        'description' => 'Pour sites vitrines, blogs, boutiques et agences.',
                        'plans' => [
                            ['Web Start', 'WEB-START', 199, null, 5, null, null],
                            ['Web Plus', 'WEB-PLUS', 399, null, 15, null, null],
                            ['Web Pro', 'WEB-PRO', 699, null, 40, null, null],
                            ['Web Agency', 'WEB-AGENCY', 1299, null, 100, null, null],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($catalog as $categoryData) {
            $category = ProductCategory::updateOrCreate(
                ['slug' => $categoryData['category']['slug']],
                array_merge($categoryData['category'], ['is_active' => true]),
            );

            foreach ($categoryData['products'] as $productPosition => $productData) {
                $product = Product::updateOrCreate(
                    ['slug' => $productData['slug']],
                    [
                        'product_category_id' => $category->id,
                        'name' => $productData['name'],
                        'short_description' => $productData['description'],
                        'description' => $productData['description'],
                        'provisioning_driver' => $category->slug === 'gaming'
                            ? 'pterodactyl'
                            : ($category->slug === 'vps' ? 'proxmox' : 'plesk'),
                        'status' => 'active',
                        'sort_order' => $productPosition + 1,
                        'is_featured' => in_array(
                            $productData['slug'],
                            ['minecraft-java', 'vps-cloud', 'hebergement-web'],
                            true,
                        ),
                    ],
                );

                foreach ($productData['plans'] as $planPosition => $planData) {
                    [
                        $name,
                        $sku,
                        $price,
                        $ram,
                        $disk,
                        $cpu,
                        $players,
                        $cores,
                    ] = array_pad($planData, 8, null);

                    ProductPlan::updateOrCreate(
                        ['sku' => $sku],
                        [
                            'product_id' => $product->id,
                            'name' => $name,
                            'slug' => str($name)->slug()->toString(),
                            'price_monthly_cents' => $price,
                            'setup_fee_cents' => 0,
                            'ram_mb' => $ram,
                            'disk_gb' => $disk,
                            'cpu_percent' => $cpu,
                            'cpu_cores' => $cores,
                            'player_slots' => $players,
                            'databases_limit' => $category->slug === 'web'
                                ? [2, 10, 50, 100][$planPosition]
                                : 2,
                            'backups_limit' => [1, 2, 4, 7][$planPosition],
                            'features' => $this->featuresFor($category->slug),
                            'provisioning_config' => [],
                            'status' => 'active',
                            'is_popular' => $planPosition === 1,
                            'sort_order' => $planPosition + 1,
                        ],
                    );
                }
            }
        }
    }

    private function featuresFor(string $category): array
    {
        return match ($category) {
            'gaming' => [
                'Panel Pterodactyl',
                'Protection anti-DDoS',
                'Sauvegardes automatiques',
                'Accès SFTP',
            ],
            'vps' => [
                'Accès administrateur',
                'Stockage NVMe',
                'IPv4 dédiée',
                'Réinstallation autonome',
            ],
            default => [
                'Certificat SSL gratuit',
                'Adresses e-mail',
                'Bases de données',
                'Sauvegardes automatiques',
            ],
        };
    }
}