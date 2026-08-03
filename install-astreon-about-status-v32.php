<?php

declare(strict_types=1);

$root = __DIR__;
$stamp = date('Ymd-His');

$files = [
    'app/Http/Controllers/PublicStatusController.php',
    'resources/js/pages/public/about.tsx',
    'resources/js/pages/public/status.tsx',
];

foreach ($files as $relative) {
    $source = __DIR__.'/'.$relative;
    $target = $root.'/'.$relative;

    if (is_file($target)) {
        copy($target, $target.'.backup-'.$stamp);
    }

    if (! is_dir(dirname($target))) {
        mkdir(dirname($target), 0775, true);
    }

    copy($source, $target);
    echo "Installé : {$relative}".PHP_EOL;
}

$routePath = $root.'/routes/web.php';
$routes = file_get_contents($routePath);
copy($routePath, $routePath.'.backup-'.$stamp);

if (! str_contains($routes, 'use App\\Http\\Controllers\\PublicStatusController;')) {
    $routes = preg_replace(
        '/(<\?php\s+)/',
        "$1\nuse App\\Http\\Controllers\\PublicStatusController;\n",
        $routes,
        1,
    );
}

if (! str_contains($routes, "name('about')")) {
    $routes .= "\nRoute::get('/a-propos', function () {\n"
        ."    return \\Inertia\\Inertia::render('public/about');\n"
        ."})->name('about');\n";
}

if (! str_contains($routes, "name('status')")) {
    $routes .= "\nRoute::get('/status', PublicStatusController::class)\n"
        ."    ->name('status');\n";
}

file_put_contents($routePath, $routes);

passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan route:list --path=a-propos');
passthru(PHP_BINARY.' artisan route:list --path=status');

echo PHP_EOL."Installation terminée.".PHP_EOL;
echo "Exécutez maintenant : composer dump-autoload puis npm run build.".PHP_EOL;
