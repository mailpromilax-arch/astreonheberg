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

$import = 'use App\Http\Controllers\Admin\ServerController;';

$routes = preg_replace(
    '/^use App\\\\Http\\\\Controllers\\\\Admin\\\\ServerController;\R/m',
    '',
    $routes,
);

$routes = preg_replace(
    '/(<\?php\R)/',
    "$1\n{$import}\n",
    $routes,
    1,
);

if (! str_contains($routes, "name('admin.servers.index')")) {
    $routes .= <<<'PHP'


Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin/servers')
    ->name('admin.servers.')
    ->group(function (): void {
        Route::get('/', [ServerController::class, 'index'])
            ->name('index');

        Route::get('/{service}', [ServerController::class, 'show'])
            ->whereNumber('service')
            ->name('show');

        Route::put('/{service}', [ServerController::class, 'update'])
            ->whereNumber('service')
            ->name('update');

        Route::post('/{service}/suspend', [ServerController::class, 'suspend'])
            ->whereNumber('service')
            ->name('suspend');

        Route::post('/{service}/activate', [ServerController::class, 'activate'])
            ->whereNumber('service')
            ->name('activate');
    });

PHP;
}

file_put_contents($routesPath, $routes);

echo "Module Services installé.\n";
echo "Sauvegarde routes : web.php.backup-{$stamp}\n\n";

passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan route:list --path=admin/servers');

echo "\nAdresse : http://127.0.0.1:8000/admin/servers\n";
