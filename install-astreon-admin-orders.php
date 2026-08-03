<?php

declare(strict_types=1);

$root = __DIR__;
$routesPath = $root.'/routes/web.php';

if (! is_file($routesPath)) {
    fwrite(STDERR, "routes/web.php introuvable.\n");
    exit(1);
}

$stamp = date('Ymd-His');
copy($routesPath, $routesPath.'.backup-'.$stamp);

$routes = file_get_contents($routesPath);

$routes = preg_replace(
    '/^use App\\\\Http\\\\Controllers\\\\Admin\\\\OrderController as AdminOrderController;\R/m',
    '',
    $routes,
);

$routes = preg_replace(
    '/^use App\\\\Http\\\\Controllers\\\\Admin\\\\OrderController;\R/m',
    '',
    $routes,
);

$routes = preg_replace(
    '/(<\?php\R)/',
    "$1\nuse App\\Http\\Controllers\\Admin\\OrderController;\n",
    $routes,
    1,
);

$routes = str_replace(
    '[AdminOrderController::class,',
    '[OrderController::class,',
    $routes,
);

if (! str_contains($routes, "name('admin.orders.index')")) {
    $routes .= <<<'PHP'


Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin/orders')
    ->name('admin.orders.')
    ->group(function (): void {
        Route::get('/', [OrderController::class, 'index'])
            ->name('index');

        Route::get('/{order}', [OrderController::class, 'show'])
            ->whereNumber('order')
            ->name('show');

        Route::patch('/{order}', [OrderController::class, 'update'])
            ->whereNumber('order')
            ->name('update');
    });

PHP;
}

file_put_contents($routesPath, $routes);

echo "Module Commandes installé.\n";
echo "Sauvegarde routes : web.php.backup-{$stamp}\n\n";

passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan route:list --path=admin/orders');

echo "\nAdresse : http://127.0.0.1:8000/admin/orders\n";
