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
    '/^use App\\\\Http\\\\Controllers\\\\Admin\\\\InfrastructureSyncController;\R/m',
    '',
    $routes,
);

$routes = preg_replace(
    '/(<\?php\R)/',
    "$1\nuse App\\Http\\Controllers\\Admin\\InfrastructureSyncController;\n",
    $routes,
    1,
);

if (! str_contains($routes, "name('admin.infrastructure.sync')")) {
    $routes .= <<<'PHP'


Route::middleware(['auth', 'verified', 'admin'])
    ->post('/admin/infrastructure/sync', InfrastructureSyncController::class)
    ->name('admin.infrastructure.sync');

PHP;
}

file_put_contents($routesPath, $routes);

echo "Module Synchronisation Pterodactyl V11 installé.\n";
echo "Sauvegarde routes : web.php.backup-{$stamp}\n\n";

passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan migrate');
passthru(PHP_BINARY.' artisan route:list --path=admin/infrastructure');

echo "\nLancez ensuite : php artisan pterodactyl:sync-infrastructure\n";
