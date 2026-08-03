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

$imports = [
    'use App\Http\Controllers\Client\Account\ContactController;',
    'use App\Http\Controllers\Client\Account\EmailHistoryController;',
    'use App\Http\Controllers\Client\Account\MemberController;',
    'use App\Http\Controllers\Client\Account\PasswordController;',
    'use App\Http\Controllers\Client\Account\PaymentMethodController;',
    'use App\Http\Controllers\Client\Account\ProfileController;',
    'use App\Http\Controllers\Client\Account\SecurityController;',
];

foreach ($imports as $import) {
    $routes = preg_replace(
        '/^'.preg_quote($import, '/').'\R/m',
        '',
        $routes,
    );
}

$routes = preg_replace(
    '/(<\?php\R)/',
    "$1\n".implode("\n", $imports)."\n",
    $routes,
    1,
);

if (! str_contains($routes, "name('client.account.profile')")) {
    $routes .= <<<'PHP'


Route::middleware(['auth', 'verified'])
    ->prefix('client/account')
    ->name('client.account.')
    ->group(function (): void {
        Route::get('/', [ProfileController::class, 'index'])
            ->name('profile');
        Route::patch('/', [ProfileController::class, 'update'])
            ->name('profile.update');

        Route::get('/members', [MemberController::class, 'index'])
            ->name('members.index');
        Route::post('/members', [MemberController::class, 'store'])
            ->name('members.store');
        Route::delete('/members/{member}', [MemberController::class, 'destroy'])
            ->whereNumber('member')
            ->name('members.destroy');

        Route::get('/payment-methods', [PaymentMethodController::class, 'index'])
            ->name('payment-methods.index');
        Route::post('/payment-methods/portal', [PaymentMethodController::class, 'portal'])
            ->name('payment-methods.portal');

        Route::get('/contacts', [ContactController::class, 'index'])
            ->name('contacts.index');
        Route::post('/contacts', [ContactController::class, 'store'])
            ->name('contacts.store');
        Route::patch('/contacts/{contact}', [ContactController::class, 'update'])
            ->whereNumber('contact')
            ->name('contacts.update');
        Route::delete('/contacts/{contact}', [ContactController::class, 'destroy'])
            ->whereNumber('contact')
            ->name('contacts.destroy');

        Route::get('/emails', [EmailHistoryController::class, 'index'])
            ->name('emails.index');
        Route::get('/emails/{email}', [EmailHistoryController::class, 'show'])
            ->whereNumber('email')
            ->name('emails.show');

        Route::get('/password', [PasswordController::class, 'edit'])
            ->name('password.edit');
        Route::put('/password', [PasswordController::class, 'update'])
            ->name('password.update');

        Route::get('/security', [SecurityController::class, 'index'])
            ->name('security.index');
    });

PHP;
}

file_put_contents($routesPath, $routes);

echo "Module Compte client V14 installé.\n";
echo "Sauvegarde routes : web.php.backup-{$stamp}\n\n";

passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan migrate');
passthru(PHP_BINARY.' artisan route:list --path=client/account');

echo "\nAdresse principale : http://127.0.0.1:8000/client/account\n";
