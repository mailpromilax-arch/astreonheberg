<?php

namespace Database\Seeders;

use App\Models\ProductPlan;
use Illuminate\Database\Seeder;

class ProductPlanConfigurationSeeder extends Seeder
{
    public function run(): void
    {
        ProductPlan::query()
            ->with('product.category')
            ->each(function (ProductPlan $plan): void {
                $category = $plan->product?->category?->slug;

                $configuration = match ($category) {
                    'gaming' => $this->gamingConfiguration($plan),
                    'vps' => $this->vpsConfiguration($plan),
                    'web' => $this->webConfiguration($plan),
                    default => [
                        'specifications' => [],
                        'provisioning_config' => [
                            'driver' => 'manual',
                        ],
                    ],
                };

                $plan->update([
                    ...$configuration,
                    'billing_cycles' => [
                        'monthly' => [
                            'enabled' => true,
                            'discount_percent' => 0,
                        ],
                        'quarterly' => [
                            'enabled' => true,
                            'discount_percent' => 3,
                        ],
                        'yearly' => [
                            'enabled' => true,
                            'discount_percent' => 10,
                        ],
                    ],
                    'stock_tracking' => false,
                    'stock_quantity' => null,
                    'allow_upgrades' => true,
                    'allow_downgrades' => true,
                ]);
            });
    }

    private function gamingConfiguration(ProductPlan $plan): array
    {
        return [
            'specifications' => [
                'ram_mb' => $plan->ram_mb,
                'disk_gb' => $plan->disk_gb,
                'cpu_percent' => $plan->cpu_percent,
                'player_slots' => $plan->player_slots,
                'databases' => $plan->databases_limit,
                'backups' => $plan->backups_limit,
                'sftp' => true,
                'console' => true,
            ],
            'provisioning_config' => [
                'driver' => 'pterodactyl',
                'egg_id' => null,
                'nest_id' => null,
                'location_id' => null,
                'node_group' => 'gaming-fr',
                'allocation_required' => true,
                'oom_disabled' => false,
            ],
        ];
    }

    private function vpsConfiguration(ProductPlan $plan): array
    {
        return [
            'specifications' => [
                'ram_mb' => $plan->ram_mb,
                'disk_gb' => $plan->disk_gb,
                'vcpu' => $plan->cpu_cores,
                'ipv4' => 1,
                'ipv6' => true,
                'traffic_tb' => 10,
                'virtualization' => 'kvm',
            ],
            'provisioning_config' => [
                'driver' => 'proxmox',
                'node_group' => 'vps-fr',
                'template_id' => null,
                'storage' => 'local-lvm',
                'bridge' => 'vmbr0',
                'cloud_init' => true,
            ],
        ];
    }

    private function webConfiguration(ProductPlan $plan): array
    {
        return [
            'specifications' => [
                'storage_gb' => $plan->disk_gb,
                'databases' => $plan->databases_limit,
                'backups' => $plan->backups_limit,
                'domains' => match ($plan->sort_order) {
                    1 => 1,
                    2 => 5,
                    3 => 15,
                    default => 50,
                },
                'email_accounts' => match ($plan->sort_order) {
                    1 => 5,
                    2 => 25,
                    3 => 100,
                    default => 500,
                },
                'ssl' => true,
                'php_versions' => [
                    '8.2',
                    '8.3',
                    '8.4',
                ],
            ],
            'provisioning_config' => [
                'driver' => 'plesk',
                'service_plan' => null,
                'server_group' => 'web-fr',
                'create_subscription' => true,
            ],
        ];
    }
}