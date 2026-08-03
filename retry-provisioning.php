<?php

use App\Models\Order;
use App\Models\Service;
use App\Services\CreateServicesFromOrder;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$orders = Order::query()
    ->where('status', 'paid')
    ->with('items')
    ->orderBy('id')
    ->get();

echo "Commandes payées trouvées : {$orders->count()}".PHP_EOL;

foreach ($orders as $order) {
    echo PHP_EOL;
    echo "Commande {$order->id} — {$order->reference}".PHP_EOL;
    echo "Articles : {$order->items->count()}".PHP_EOL;

    if ($order->items->isEmpty()) {
        echo "IGNORÉE : aucun article dans cette commande.".PHP_EOL;
        continue;
    }

    try {
        app(CreateServicesFromOrder::class)->handle($order);

        $services = Service::query()
            ->where('order_id', $order->id)
            ->get();

        echo "Services associés : {$services->count()}".PHP_EOL;

        foreach ($services as $service) {
            echo "- {$service->id} | {$service->status} | "
                ."{$service->provider} | "
                .($service->external_id ?: 'aucun serveur')
                .PHP_EOL;

            if ($service->status === 'failed') {
                echo "  Erreur : "
                    .data_get(
                        $service->metadata,
                        'provisioning_error',
                        'Erreur inconnue',
                    )
                    .PHP_EOL;
            }
        }
    } catch (Throwable $exception) {
        echo "ERREUR GLOBALE : {$exception->getMessage()}".PHP_EOL;
        echo $exception->getTraceAsString().PHP_EOL;
    }
}
