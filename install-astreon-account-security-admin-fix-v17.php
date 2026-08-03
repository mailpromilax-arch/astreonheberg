<?php

declare(strict_types=1);

$root = __DIR__;
$stamp = date('Ymd-His');

$files = [
    'app/Http/Controllers/Client/Account/ProfileController.php',
    'app/Http/Controllers/Client/Account/SecurityController.php',
    'resources/js/pages/client/account/security/index.tsx',
    'app/Http/Controllers/Admin/UserController.php',
    'resources/js/pages/admin/users/show.tsx',
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

/*
 * S'assure que le modèle User utilise les traits nécessaires,
 * sans remplacer les relations et propriétés existantes du projet.
 */
$userPath = $root.'/app/Models/User.php';
$user = file_get_contents($userPath);

if (! str_contains($user, 'use Laravel\\Cashier\\Billable;')) {
    $user = preg_replace(
        '/namespace App\\\\Models;\R/',
        "namespace App\\Models;\n\nuse Laravel\\Cashier\\Billable;\n",
        $user,
        1,
    );
}

if (! str_contains($user, 'use Laravel\\Fortify\\TwoFactorAuthenticatable;')) {
    $user = preg_replace(
        '/namespace App\\\\Models;\R/',
        "namespace App\\Models;\n\nuse Laravel\\Fortify\\TwoFactorAuthenticatable;\n",
        $user,
        1,
    );
}

if (! preg_match('/\buse\s+[^;]*\bBillable\b[^;]*;/', $user)) {
    $user = preg_replace(
        '/class User[^{]*\{\R/',
        "$0    use Billable;\n",
        $user,
        1,
    );
}

if (! preg_match('/\buse\s+[^;]*\bTwoFactorAuthenticatable\b[^;]*;/', $user)) {
    $user = preg_replace(
        '/class User[^{]*\{\R/',
        "$0    use TwoFactorAuthenticatable;\n",
        $user,
        1,
    );
}

copy($userPath, $userPath.'.backup-'.$stamp);
file_put_contents($userPath, $user);

/*
 * Active officiellement la fonctionnalité 2FA Fortify.
 */
$fortifyPath = $root.'/config/fortify.php';

if (is_file($fortifyPath)) {
    $fortify = file_get_contents($fortifyPath);
    copy($fortifyPath, $fortifyPath.'.backup-'.$stamp);

    $fortify = preg_replace(
        '/\/\/\s*Features::twoFactorAuthentication\([^;]*\),?/s',
        "Features::twoFactorAuthentication([\n            'confirm' => true,\n            'confirmPassword' => false,\n        ]),",
        $fortify,
    );

    if (! str_contains($fortify, 'Features::twoFactorAuthentication(')) {
        $fortify = preg_replace(
            "/('features'\\s*=>\\s*\\[)/",
            "$1\n        Features::twoFactorAuthentication([\n            'confirm' => true,\n            'confirmPassword' => false,\n        ]),",
            $fortify,
            1,
        );
    }

    file_put_contents($fortifyPath, $fortify);
}

/*
 * Ajoute la route admin pour supprimer une carte Stripe.
 */
$routesPath = $root.'/routes/web.php';
$routes = file_get_contents($routesPath);
copy($routesPath, $routesPath.'.backup-'.$stamp);

if (! str_contains($routes, "admin.users.payment-methods.destroy")) {
    $routes .= <<<'PHP'


Route::middleware(['auth', 'verified', 'admin'])
    ->delete(
        '/admin/users/{user}/payment-methods/{paymentMethod}',
        [\App\Http\Controllers\Admin\UserController::class, 'deletePaymentMethod'],
    )
    ->whereNumber('user')
    ->name('admin.users.payment-methods.destroy');

PHP;
}

file_put_contents($routesPath, $routes);

echo "\nNettoyage des caches...\n";
passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan route:list --path=two-factor');
passthru(PHP_BINARY.' artisan route:list --path=admin/users');

echo "\nCorrectif V17 installé.\n";
