<?php

declare(strict_types=1);

$root = __DIR__;
$stamp = date('Ymd-His');

$files = [
    'app/Http/Controllers/Notifications/NotificationController.php',
    'app/Http/Middleware/ShareNotificationCenter.php',
    'app/Models/PlatformNotification.php',
    'app/Observers/AdminLogObserver.php',
    'app/Observers/TicketObserver.php',
    'app/Observers/TicketReplyObserver.php',
    'app/Providers/NotificationCenterServiceProvider.php',
    'app/Services/Notifications/NotificationCenter.php',
    'database/migrations/2026_08_03_120000_create_platform_notifications_table.php',
    'resources/js/components/notifications/notification-bell.tsx',
    'resources/js/pages/client/notifications/index.tsx',
    'resources/js/pages/admin/notifications/index.tsx',
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
 * Enregistre le ServiceProvider.
 */
$providersPath = $root.'/bootstrap/providers.php';
$providers = file_get_contents($providersPath);
copy($providersPath, $providersPath.'.backup-'.$stamp);

$providerClass = '\\App\\Providers\\NotificationCenterServiceProvider::class';

if (! str_contains($providers, $providerClass)) {
    $position = strrpos($providers, '];');

    if ($position === false) {
        fwrite(STDERR, "Format bootstrap/providers.php non reconnu.\n");
        exit(1);
    }

    $providers = substr($providers, 0, $position)
        ."    {$providerClass},\n"
        .substr($providers, $position);

    file_put_contents($providersPath, $providers);
}

/*
 * Ajoute le middleware de partage Inertia.
 */
$bootstrapPath = $root.'/bootstrap/app.php';
$bootstrap = file_get_contents($bootstrapPath);
copy($bootstrapPath, $bootstrapPath.'.backup-'.$stamp);

if (! str_contains($bootstrap, 'use App\\Http\\Middleware\\ShareNotificationCenter;')) {
    $bootstrap = preg_replace(
        '/(<\?php\R)/',
        "$1\nuse App\\Http\\Middleware\\ShareNotificationCenter;\n",
        $bootstrap,
        1,
    );
}

if (! str_contains($bootstrap, 'ShareNotificationCenter::class')) {
    $bootstrap = preg_replace(
        '/(\$middleware->web\(append:\s*\[\s*)/',
        "$1\n            ShareNotificationCenter::class,\n",
        $bootstrap,
        1,
    );
}

file_put_contents($bootstrapPath, $bootstrap);

/*
 * Routes.
 */
$routesPath = $root.'/routes/web.php';
$routes = file_get_contents($routesPath);
copy($routesPath, $routesPath.'.backup-'.$stamp);

if (! str_contains($routes, "notification-center.summary")) {
    $routes .= <<<'PHP'


Route::middleware(['auth'])->group(function (): void {
    Route::get(
        '/notification-center/summary',
        [\App\Http\Controllers\Notifications\NotificationController::class, 'summary'],
    )->name('notification-center.summary');

    Route::patch(
        '/notification-center/{notification}/read',
        [\App\Http\Controllers\Notifications\NotificationController::class, 'read'],
    )->name('notification-center.read');

    Route::post(
        '/notification-center/read-all',
        [\App\Http\Controllers\Notifications\NotificationController::class, 'readAll'],
    )->name('notification-center.read-all');

    Route::delete(
        '/notification-center/{notification}',
        [\App\Http\Controllers\Notifications\NotificationController::class, 'destroy'],
    )->name('notification-center.destroy');

    Route::get(
        '/client/notifications',
        [\App\Http\Controllers\Notifications\NotificationController::class, 'clientIndex'],
    )->name('client.notifications.index');

    Route::middleware('admin')->get(
        '/admin/notifications',
        [\App\Http\Controllers\Notifications\NotificationController::class, 'adminIndex'],
    )->name('admin.notifications.index');
});

PHP;
}

file_put_contents($routesPath, $routes);

/*
 * Installe la cloche dans le layout client.
 */
$clientLayoutPath = $root.'/resources/js/layouts/client-layout.tsx';

if (is_file($clientLayoutPath)) {
    $client = file_get_contents($clientLayoutPath);
    copy($clientLayoutPath, $clientLayoutPath.'.backup-'.$stamp);

    if (! str_contains($client, "components/notifications/notification-bell")) {
        $client = preg_replace(
            "/(import AstreonLogo[^;]+;\R)/",
            "$1import NotificationBell from '@/components/notifications/notification-bell';\n",
            $client,
            1,
        );
    }

    /*
     * Remplace la petite cloche supérieure contenant le badge statique "1".
     */
    $client = preg_replace(
        '/<span className="relative">\s*<Bell className="h-4 w-4"\s*\/>\s*<span[^>]*>1<\/span>\s*<\/span>/s',
        '<NotificationBell variant="client" />',
        $client,
        1,
    );

    file_put_contents($clientLayoutPath, $client);
}

/*
 * Installe la cloche dans toutes les copies admin-shell.tsx.
 */
$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator(
        $root.'/resources/js/pages/admin',
        FilesystemIterator::SKIP_DOTS,
    ),
);

foreach ($iterator as $file) {
    if ($file->getFilename() !== 'admin-shell.tsx') {
        continue;
    }

    $path = $file->getPathname();
    $shell = file_get_contents($path);
    copy($path, $path.'.backup-'.$stamp);

    if (! str_contains($shell, "components/notifications/notification-bell")) {
        $shell = preg_replace(
            "/(import type \{ ReactNode \} from 'react';\R)/",
            "$1import NotificationBell from '@/components/notifications/notification-bell';\n",
            $shell,
            1,
        );
    }

    $shell = preg_replace(
        '/<button\s+type="button"\s+className="relative grid h-10 w-10 place-items-center rounded-xl border border-white\/10 text-slate-400"\s*>\s*<Bell className="h-5 w-5"\s*\/>\s*<span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-fuchsia-400"\s*\/>\s*<\/button>/s',
        '<NotificationBell variant="admin" />',
        $shell,
    );

    file_put_contents($path, $shell);
}

/*
 * Notifications explicites pour les actions sensibles actuellement connues.
 */
$userControllerPath = $root.'/app/Http/Controllers/Admin/UserController.php';

if (is_file($userControllerPath)) {
    $controller = file_get_contents($userControllerPath);
    copy($userControllerPath, $userControllerPath.'.backup-'.$stamp);

    if (! str_contains($controller, 'use App\\Services\\Notifications\\NotificationCenter;')) {
        $controller = preg_replace(
            '/(use App\\\\Models\\\\User;\R)/',
            "$1use App\\Services\\Notifications\\NotificationCenter;\n",
            $controller,
            1,
        );
    }

    if (! str_contains($controller, "'security.temporary_password'")) {
        $controller = str_replace(
            "        return redirect()\n            ->route('admin.users.show', \$user)\n            ->with('temporary_password', \$password)",
            "        app(NotificationCenter::class)->majorAccountChange(\n            \$user,\n            'security.temporary_password',\n            'Mot de passe temporaire généré',\n            'Un administrateur a généré un mot de passe temporaire pour votre compte.',\n            \$request->user(),\n            'danger',\n            '/client/account/security',\n        );\n\n        return redirect()\n            ->route('admin.users.show', \$user)\n            ->with('temporary_password', \$password)",
            $controller,
        );
    }

    if (! str_contains($controller, "'security.two_factor_disabled'")) {
        $controller = str_replace(
            "        return redirect()\n            ->route('admin.users.show', \$user)\n            ->with('success', 'Double authentification désactivée.');",
            "        app(NotificationCenter::class)->majorAccountChange(\n            \$user,\n            'security.two_factor_disabled',\n            'Double authentification désactivée',\n            'La double authentification de votre compte a été désactivée par un administrateur.',\n            \$request->user(),\n            'warning',\n            '/client/account/security',\n        );\n\n        return redirect()\n            ->route('admin.users.show', \$user)\n            ->with('success', 'Double authentification désactivée.');",
            $controller,
        );
    }

    file_put_contents($userControllerPath, $controller);
}

$paymentControllerPath = $root.'/app/Http/Controllers/Admin/UserPaymentMethodController.php';

if (is_file($paymentControllerPath)) {
    $controller = file_get_contents($paymentControllerPath);
    copy($paymentControllerPath, $paymentControllerPath.'.backup-'.$stamp);

    if (! str_contains($controller, 'use App\\Services\\Notifications\\NotificationCenter;')) {
        $controller = preg_replace(
            '/(use App\\\\Models\\\\User;\R)/',
            "$1use App\\Services\\Notifications\\NotificationCenter;\n",
            $controller,
            1,
        );
    }

    if (! str_contains($controller, "'billing.payment_method_deleted'")) {
        $controller = str_replace(
            "        return back()->with(\n            'success',\n            'Le moyen de paiement du client a été supprimé.',\n        );",
            "        app(NotificationCenter::class)->majorAccountChange(\n            \$user,\n            'billing.payment_method_deleted',\n            'Moyen de paiement supprimé',\n            'Un administrateur a supprimé un moyen de paiement de votre compte.',\n            \$request->user(),\n            'warning',\n            '/client/account/payment-methods',\n            ['payment_method_id' => \$paymentMethod],\n        );\n\n        return back()->with(\n            'success',\n            'Le moyen de paiement du client a été supprimé.',\n        );",
            $controller,
        );
    }

    file_put_contents($paymentControllerPath, $controller);
}

echo "\nMigration et nettoyage...\n";
passthru(PHP_BINARY.' artisan migrate');
passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan event:list');
passthru(PHP_BINARY.' artisan route:list --path=notification');

echo "\nCentre de notifications V22 installé.\n";
echo "Exécutez maintenant composer dump-autoload puis npm run build.\n";
