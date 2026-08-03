<?php

declare(strict_types=1);

$root = __DIR__;
$stamp = date('Ymd-His');

$files = [
    'app/Http/Controllers/CheckoutController.php',
    'resources/js/pages/store/checkout.tsx',
];

foreach ($files as $relative) {
    $source = __DIR__.'/'.$relative;
    $target = $root.'/'.$relative;

    if (! is_file($source)) {
        fwrite(STDERR, "Source introuvable : {$relative}\n");
        exit(1);
    }

    if (is_file($target)) {
        copy($target, $target.'.backup-'.$stamp);
    }

    if (! is_dir(dirname($target))) {
        mkdir(dirname($target), 0775, true);
    }

    copy($source, $target);
    echo "Installé : {$relative}\n";
}

$modelPath = $root.'/app/Models/WalletTopUp.php';

if (is_file($modelPath)) {
    $model = file_get_contents($modelPath);

    if (! str_contains($model, "protected \$table = 'wallet_topups';")) {
        copy($modelPath, $modelPath.'.backup-'.$stamp);

        $model = str_replace(
            "final class WalletTopUp extends Model\n{",
            "final class WalletTopUp extends Model\n{\n"
            ."    protected \$table = 'wallet_topups';\n",
            $model,
        );

        file_put_contents($modelPath, $model);
        echo "Corrigé : app/Models/WalletTopUp.php\n";
    }
}

$routePath = $root.'/routes/web.php';
$routes = file_get_contents($routePath);
copy($routePath, $routePath.'.backup-'.$stamp);

if (! str_contains($routes, "name('checkout.paypal.create')")) {
    $needle = <<<'PHP'
    Route::post('/checkout', [CheckoutController::class, 'store'])
        ->name('checkout.store');
PHP;

    $replacement = $needle.<<<'PHP'


    Route::post('/checkout/paypal', [
        CheckoutController::class,
        'paypalCreate',
    ])->name('checkout.paypal.create');

    Route::get('/checkout/paypal/return', [
        CheckoutController::class,
        'paypalReturn',
    ])->name('checkout.paypal.return');

    Route::get('/checkout/paypal/cancel', [
        CheckoutController::class,
        'paypalCancel',
    ])->name('checkout.paypal.cancel');
PHP;

    if (! str_contains($routes, $needle)) {
        fwrite(
            STDERR,
            "Route checkout.store introuvable dans routes/web.php.\n",
        );
        exit(1);
    }

    $routes = str_replace(
        $needle,
        $replacement,
        $routes,
    );

    file_put_contents($routePath, $routes);
    echo "Modifié : routes/web.php\n";
}

$servicesPath = $root.'/config/services.php';

if (is_file($servicesPath)) {
    $services = file_get_contents($servicesPath);

    if (! str_contains($services, "'paypal' => [")) {
        copy($servicesPath, $servicesPath.'.backup-'.$stamp);

        $block = <<<'PHP'

    'paypal' => [
        'mode' => env('PAYPAL_MODE', 'sandbox'),
        'client_id' => env('PAYPAL_CLIENT_ID'),
        'client_secret' => env('PAYPAL_CLIENT_SECRET'),
    ],

PHP;

        $position = strrpos($services, '];');

        if ($position === false) {
            fwrite(STDERR, "config/services.php non reconnu.\n");
            exit(1);
        }

        $services = substr($services, 0, $position)
            .$block
            .substr($services, $position);

        file_put_contents($servicesPath, $services);
        echo "Modifié : config/services.php\n";
    }
}

passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan route:list --path=checkout');

echo "\nCorrectif PayPal + Stripe + portefeuille V31 installé.\n";
echo "Exécutez ensuite : composer dump-autoload puis npm run build.\n";
