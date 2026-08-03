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
    '/^use App\\\\Http\\\\Controllers\\\\Admin\\\\PaymentController;\R/m',
    '',
    $routes,
);

$routes = preg_replace(
    '/(<\?php\R)/',
    "$1\nuse App\\Http\\Controllers\\Admin\\PaymentController;\n",
    $routes,
    1,
);

if (! str_contains($routes, "name('admin.payments.index')")) {
    $routes .= <<<'PHP'


Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin/payments')
    ->name('admin.payments.')
    ->group(function (): void {
        Route::get('/', [PaymentController::class, 'index'])
            ->name('index');

        Route::get('/{payment}', [PaymentController::class, 'show'])
            ->whereNumber('payment')
            ->name('show');
    });

PHP;
}

file_put_contents($routesPath, $routes);

echo "Module Paiements installé.\n";
echo "Sauvegarde routes : web.php.backup-{$stamp}\n\n";

passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan route:list --path=admin/payments');

echo "\nAdresse : http://127.0.0.1:8000/admin/payments\n";
