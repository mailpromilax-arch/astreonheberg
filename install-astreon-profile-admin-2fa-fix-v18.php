<?php

declare(strict_types=1);

$root = __DIR__;
$stamp = date('Ymd-His');

$files = [
    'app/Http/Controllers/Client/Account/ProfileController.php',
    'app/Http/Controllers/Admin/UserController.php',
    'app/Http/Middleware/ShareFlashData.php',
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

$bootstrapPath = $root.'/bootstrap/app.php';
$bootstrap = file_get_contents($bootstrapPath);
copy($bootstrapPath, $bootstrapPath.'.backup-'.$stamp);

if (! str_contains($bootstrap, 'use App\\Http\\Middleware\\ShareFlashData;')) {
    $bootstrap = preg_replace(
        '/(<\?php\R)/',
        "$1\nuse App\\Http\\Middleware\\ShareFlashData;\n",
        $bootstrap,
        1,
    );
}

if (! str_contains($bootstrap, 'ShareFlashData::class')) {
    $bootstrap = preg_replace(
        '/(\$middleware->web\(append:\s*\[\s*)/',
        "$1\n            ShareFlashData::class,\n",
        $bootstrap,
        1,
    );
}

file_put_contents($bootstrapPath, $bootstrap);

$routesPath = $root.'/routes/web.php';
$routes = file_get_contents($routesPath);
copy($routesPath, $routesPath.'.backup-'.$stamp);

if (! str_contains($routes, "admin.users.disable-two-factor")) {
    $routes .= <<<'PHP'


Route::middleware(['auth', 'verified', 'admin'])
    ->post(
        '/admin/users/{user}/disable-2fa',
        [\App\Http\Controllers\Admin\UserController::class, 'disableTwoFactor'],
    )
    ->whereNumber('user')
    ->name('admin.users.disable-two-factor');

PHP;
}

file_put_contents($routesPath, $routes);

echo "\nExécution des migrations...\n";
passthru(PHP_BINARY.' artisan migrate');
passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan route:list --path=admin/users');
passthru(PHP_BINARY.' artisan route:list --path=two-factor');

echo "\nCorrectif V18 installé.\n";
