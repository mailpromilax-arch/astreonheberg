<?php
declare(strict_types=1);

use App\Models\Order;
use App\Models\Service;
use App\Services\CreateServicesFromOrder;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$order = Order::query()
    ->where('status', 'paid')
    ->with('items')
    ->latest('id')
    ->first();

if (! $order) {
    echo "ERREUR : aucune commande payée trouvée.".PHP_EOL;
    exit(1);
}

echo "Commande : {$order->reference}".PHP_EOL;
echo "Articles : {$order->items->count()}".PHP_EOL;

if ($order->items->isEmpty()) {
    echo "ERREUR : la commande ne contient aucun article.".PHP_EOL;
    exit(1);
}

try {
    app(CreateServicesFromOrder::class)->handle($order);
} catch (Throwable $exception) {
    echo "ERREUR GLOBALE : {$exception->getMessage()}".PHP_EOL;
}

$services = Service::query()
    ->where('order_id', $order->id)
    ->get();

echo "Services trouvés : {$services->count()}".PHP_EOL;

foreach ($services as $service) {
    echo PHP_EOL;
    echo "ID : {$service->id}".PHP_EOL;
    echo "Nom : {$service->name}".PHP_EOL;
    echo "Statut : {$service->status}".PHP_EOL;
    echo "Provider : {$service->provider}".PHP_EOL;
    echo "External ID : ".($service->external_id ?: 'aucun').PHP_EOL;

    $error = data_get(
        $service->metadata,
        'provisioning_error',
    );

    if ($error) {
        echo "Erreur : {$error}".PHP_EOL;
    }
}