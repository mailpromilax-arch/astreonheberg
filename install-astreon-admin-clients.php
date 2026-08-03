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

$import = 'use App\Http\Controllers\Admin\UserController;';

$routes = preg_replace(
    '/^use App\\\\Http\\\\Controllers\\\\Admin\\\\UserController;\R/m',
    '',
    $routes,
);

$routes = preg_replace(
    '/(<\?php\R)/',
    "$1\n{$import}\n",
    $routes,
    1,
);

if (! str_contains($routes, "name('admin.users.index')")) {
    $routes .= <<<'PHP'


Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin/users')
    ->name('admin.users.')
    ->group(function (): void {
        Route::get('/', [UserController::class, 'index'])
            ->name('index');

        Route::get('/{user}', [UserController::class, 'show'])
            ->whereNumber('user')
            ->name('show');

        Route::put('/{user}', [UserController::class, 'update'])
            ->whereNumber('user')
            ->name('update');

        Route::post('/{user}/temporary-password', [UserController::class, 'temporaryPassword'])
            ->whereNumber('user')
            ->name('temporary-password');

        Route::post('/{user}/disable-2fa', [UserController::class, 'disableTwoFactor'])
            ->whereNumber('user')
            ->name('disable-2fa');

        Route::post('/{user}/suspend', [UserController::class, 'suspend'])
            ->whereNumber('user')
            ->name('suspend');

        Route::post('/{user}/activate', [UserController::class, 'activate'])
            ->whereNumber('user')
            ->name('activate');
    });

PHP;
}

file_put_contents($routesPath, $routes);

echo "Module Clients installé.\n";
echo "Sauvegarde routes : web.php.backup-{$stamp}\n\n";

passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan route:list --path=admin/users');

echo "\nAdresse : http://127.0.0.1:8000/admin/users\n";
