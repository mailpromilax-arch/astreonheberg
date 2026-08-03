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

$import = 'use App\Http\Controllers\Client\ClientTicketController;';

$routes = preg_replace(
    '/^use App\\\\Http\\\\Controllers\\\\Client\\\\ClientTicketController;\R/m',
    '',
    $routes,
);

$routes = preg_replace(
    '/(<\?php\R)/',
    "$1\n{$import}\n",
    $routes,
    1,
);

if (! str_contains($routes, "name('client.support.index')")) {
    $routes .= <<<'PHP'


Route::middleware(['auth', 'verified'])
    ->prefix('client/support')
    ->name('client.support.')
    ->group(function (): void {
        Route::get('/', [ClientTicketController::class, 'index'])
            ->name('index');

        Route::get('/create', [ClientTicketController::class, 'create'])
            ->name('create');

        Route::post('/', [ClientTicketController::class, 'store'])
            ->name('store');

        Route::get('/attachments/{attachment}', [ClientTicketController::class, 'attachment'])
            ->whereNumber('attachment')
            ->name('attachments.download');

        Route::get('/{ticket}', [ClientTicketController::class, 'show'])
            ->whereNumber('ticket')
            ->name('show');

        Route::post('/{ticket}/reply', [ClientTicketController::class, 'reply'])
            ->whereNumber('ticket')
            ->name('reply');
    });

PHP;
}

file_put_contents($routesPath, $routes);

echo "Module Support Client installé.\n";
echo "Sauvegarde routes : web.php.backup-{$stamp}\n\n";

passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan storage:link');
passthru(PHP_BINARY.' artisan route:list --path=client/support');

echo "\nAdresse : http://127.0.0.1:8000/client/support\n";
