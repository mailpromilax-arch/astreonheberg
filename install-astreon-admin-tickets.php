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

$import = 'use App\Http\Controllers\Admin\TicketController;';

$routes = preg_replace(
    '/^use App\\\\Http\\\\Controllers\\\\Admin\\\\TicketController;\R/m',
    '',
    $routes,
);

$routes = preg_replace(
    '/(<\?php\R)/',
    "$1\n{$import}\n",
    $routes,
    1,
);

if (! str_contains($routes, "name('admin.tickets.index')")) {
    $routes .= <<<'PHP'


Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin/tickets')
    ->name('admin.tickets.')
    ->group(function (): void {
        Route::get('/', [TicketController::class, 'index'])
            ->name('index');

        Route::get('/{ticket}', [TicketController::class, 'show'])
            ->whereNumber('ticket')
            ->name('show');

        Route::post('/{ticket}/assign', [TicketController::class, 'assign'])
            ->whereNumber('ticket')
            ->name('assign');

        Route::post('/{ticket}/reply', [TicketController::class, 'reply'])
            ->whereNumber('ticket')
            ->name('reply');

        Route::post('/{ticket}/close', [TicketController::class, 'close'])
            ->whereNumber('ticket')
            ->name('close');

        Route::post('/{ticket}/reopen', [TicketController::class, 'reopen'])
            ->whereNumber('ticket')
            ->name('reopen');
    });

Route::middleware(['auth', 'verified', 'admin'])
    ->get('/admin/ticket-attachments/{attachment}', [TicketController::class, 'attachment'])
    ->whereNumber('attachment')
    ->name('admin.ticket-attachments.download');

PHP;
}

file_put_contents($routesPath, $routes);

echo "Module Tickets installé.\n";
echo "Sauvegarde routes : web.php.backup-{$stamp}\n\n";

passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan migrate');
passthru(PHP_BINARY.' artisan storage:link');
passthru(PHP_BINARY.' artisan route:list --path=admin/tickets');

echo "\nAdresse : http://127.0.0.1:8000/admin/tickets\n";
