<?php

declare(strict_types=1);

$root = __DIR__;
$stamp = date('Ymd-His');

$files = [
    'app/Http/Controllers/CartController.php',
    'app/Http/Controllers/CheckoutController.php',
    'app/Http/Controllers/StoreController.php',
    'resources/js/components/astreon/PublicHeader.tsx',
    'resources/js/pages/store/show.tsx',
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

$routePath = $root.'/routes/web.php';
$routes = file_get_contents($routePath);
copy($routePath, $routePath.'.backup-'.$stamp);

$routeBlock = <<<'PHP'

Route::get('/boutique/{catalogSlug}', [StoreController::class, 'landing'])
    ->whereIn('catalogSlug', [
        'vps-cloud',
        'fivem',
        'minecraft-java',
        'minecraft-bedrock',
        'ark',
        'palworld',
    ])
    ->name('store.landing');

PHP;

if (! str_contains($routes, "->name('store.landing')")) {
    $needle = "Route::get('/boutique/{product:slug}', [StoreController::class, 'show'])";

    $position = strpos($routes, $needle);

    if ($position === false) {
        fwrite(STDERR, "Route boutique dynamique introuvable.\n");
        exit(1);
    }

    $routes = substr($routes, 0, $position)
        .$routeBlock
        .substr($routes, $position);

    file_put_contents($routePath, $routes);
}

passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan route:list --path=boutique');

echo "\nCorrectif boutique et ARK V28 installé.\n";
echo "Exécutez composer dump-autoload puis npm run build.\n";
