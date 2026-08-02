<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientServiceController extends Controller
{
    public function index(Request $request): Response
    {
        Service::query()
            ->where('user_id', $request->user()->id)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->whereNotIn('status', [
                'cancelled',
                'failed',
                'expired',
            ])
            ->update([
                'status' => 'expired',
            ]);

        return Inertia::render('client/services/index', [
            'services' => Service::query()
                ->where('user_id', $request->user()->id)
                ->with([
                    'plan:id,name,slug,product_id',
                    'plan.product:id,name,slug',
                ])
                ->latest()
                ->paginate(15),
        ]);
    }

    public function show(
        Request $request,
        Service $service,
    ): Response {
        abort_unless(
            (int) $service->user_id === (int) $request->user()->id,
            403,
        );

        $service->load([
            'order:id,reference,status',
            'plan:id,name,slug,product_id',
            'plan.product:id,name,slug',
        ]);

        $configuration = is_array($service->configuration)
            ? $service->configuration
            : [];

        $planSnapshot = data_get(
            $configuration,
            'plan_snapshot',
            [],
        );

        $specifications = data_get(
            $planSnapshot,
            'specifications',
            [],
        );

        $configuration['delivered_resources'] = array_merge(
            [
                'memory_mb' => 0,
                'disk_mb' => 0,
                'cpu_percent' => 0,
                'player_slots' => 0,
                'databases' => 0,
                'backups' => 0,
            ],
            is_array(
                data_get(
                    $configuration,
                    'delivered_resources',
                ),
            )
                ? data_get(
                    $configuration,
                    'delivered_resources',
                )
                : [],
            [
                'memory_mb' => (int) (
                    data_get(
                        $configuration,
                        'delivered_resources.memory_mb',
                    )
                    ?: data_get($specifications, 'ram_mb', 0)
                ),
                'disk_mb' => (int) (
                    data_get(
                        $configuration,
                        'delivered_resources.disk_mb',
                    )
                    ?: (
                        (int) data_get(
                            $specifications,
                            'disk_gb',
                            0,
                        ) * 1024
                    )
                ),
                'cpu_percent' => (int) (
                    data_get(
                        $configuration,
                        'delivered_resources.cpu_percent',
                    )
                    ?: data_get(
                        $specifications,
                        'cpu_percent',
                        0,
                    )
                ),
                'player_slots' => (int) (
                    data_get(
                        $configuration,
                        'delivered_resources.player_slots',
                    )
                    ?: data_get(
                        $specifications,
                        'player_slots',
                        0,
                    )
                ),
                'databases' => (int) (
                    data_get(
                        $configuration,
                        'delivered_resources.databases',
                    )
                    ?: data_get(
                        $specifications,
                        'databases',
                        0,
                    )
                ),
                'backups' => (int) (
                    data_get(
                        $configuration,
                        'delivered_resources.backups',
                    )
                    ?: data_get(
                        $specifications,
                        'backups',
                        0,
                    )
                ),
            ],
        );

        /*
         * L'allocation est déjà enregistrée dans configuration lors du
         * provisionnement. Les métadonnées servent seulement de secours
         * pour les anciens services.
         */
        $existingAllocation = data_get(
            $configuration,
            'allocation',
            [],
        );

        $configuration['allocation'] = [
            'id' => data_get(
                $existingAllocation,
                'id',
                data_get($service->metadata, 'allocation.id'),
            ),
            'ip' => data_get(
                $existingAllocation,
                'ip',
                data_get($service->metadata, 'allocation.ip'),
            ),
            'alias' => data_get(
                $existingAllocation,
                'alias',
                data_get($service->metadata, 'allocation.alias'),
            ),
            'port' => data_get(
                $existingAllocation,
                'port',
                data_get($service->metadata, 'allocation.port'),
            ),
        ];

        $service->setAttribute(
            'configuration',
            $configuration,
        );

        return Inertia::render('client/services/show', [
            'service' => $service,
        ]);
    }
}