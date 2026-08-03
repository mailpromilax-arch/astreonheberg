<?php

declare(strict_types=1);

$root = __DIR__;
$stamp = date('Ymd-His');

$files = [
    'app/Http/Controllers/Client/Account/PaymentMethodController.php',
    'app/Http/Controllers/Admin/UserPaymentMethodController.php',
    'resources/js/pages/client/account/payment-methods/index.tsx',
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

$routesPath = $root.'/routes/web.php';
$routes = file_get_contents($routesPath);
copy($routesPath, $routesPath.'.backup-'.$stamp);

/*
 * Retire les anciennes routes V14/V16 du portail Stripe pour éviter les doublons.
 */
$routes = preg_replace(
    "/\s*Route::post\('\\/payment-methods\\/portal'.*?;\R/s",
    "\n",
    $routes,
);

/*
 * Ajoute les routes client dans le groupe client/account existant lorsque possible.
 */
$clientRoutes = <<<'PHP'

        Route::post(
            '/payment-methods/setup',
            [PaymentMethodController::class, 'setup'],
        )->name('payment-methods.setup');

        Route::patch(
            '/payment-methods/{paymentMethod}/default',
            [PaymentMethodController::class, 'makeDefault'],
        )->name('payment-methods.default');

        Route::delete(
            '/payment-methods/{paymentMethod}',
            [PaymentMethodController::class, 'destroy'],
        )->name('payment-methods.destroy');
PHP;

if (! str_contains($routes, "name('payment-methods.setup')")) {
    $needle = "        Route::get('/payment-methods', [PaymentMethodController::class, 'index'])\n            ->name('payment-methods.index');";

    if (str_contains($routes, $needle)) {
        $routes = str_replace(
            $needle,
            $needle."\n".$clientRoutes,
            $routes,
        );
    } else {
        $routes .= <<<'PHP'


Route::middleware(['auth', 'verified'])
    ->prefix('client/account')
    ->name('client.account.')
    ->group(function (): void {
        Route::get(
            '/payment-methods',
            [\App\Http\Controllers\Client\Account\PaymentMethodController::class, 'index'],
        )->name('payment-methods.index');

        Route::post(
            '/payment-methods/setup',
            [\App\Http\Controllers\Client\Account\PaymentMethodController::class, 'setup'],
        )->name('payment-methods.setup');

        Route::patch(
            '/payment-methods/{paymentMethod}/default',
            [\App\Http\Controllers\Client\Account\PaymentMethodController::class, 'makeDefault'],
        )->name('payment-methods.default');

        Route::delete(
            '/payment-methods/{paymentMethod}',
            [\App\Http\Controllers\Client\Account\PaymentMethodController::class, 'destroy'],
        )->name('payment-methods.destroy');
    });

PHP;
    }
}

/*
 * Route admin robuste. Elle utilise un contrôleur dédié et vérifie que
 * le moyen de paiement appartient bien au client ciblé.
 */
if (! str_contains($routes, "admin.users.payment-methods.secure-destroy")) {
    $routes .= <<<'PHP'


Route::middleware(['auth', 'verified', 'admin'])
    ->delete(
        '/admin/users/{user}/stripe-payment-methods/{paymentMethod}',
        [\App\Http\Controllers\Admin\UserPaymentMethodController::class, 'destroy'],
    )
    ->whereNumber('user')
    ->name('admin.users.payment-methods.secure-destroy');

PHP;
}

file_put_contents($routesPath, $routes);

/*
 * Adapte automatiquement l'URL du bouton Supprimer dans la fiche admin,
 * si le composant contient déjà la section Stripe des correctifs précédents.
 */
$adminShowPath = $root.'/resources/js/pages/admin/users/show.tsx';

if (is_file($adminShowPath)) {
    $adminShow = file_get_contents($adminShowPath);
    copy($adminShowPath, $adminShowPath.'.backup-'.$stamp);

    $adminShow = str_replace(
        '`/admin/users/${user.id}/payment-methods/${method.id}`',
        '`/admin/users/${user.id}/stripe-payment-methods/${method.id}`',
        $adminShow,
    );

    file_put_contents($adminShowPath, $adminShow);
}

echo "\nNettoyage des caches...\n";
passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan route:list --path=client/account/payment-methods');
passthru(PHP_BINARY.' artisan route:list --path=stripe-payment-methods');

echo "\nCorrectif Stripe V21 installé.\n";
echo "Lancez maintenant : composer dump-autoload puis npm run build\n";
