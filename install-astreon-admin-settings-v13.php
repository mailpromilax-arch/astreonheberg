<?php

declare(strict_types=1);

$root = __DIR__;
$routesPath = $root.'/routes/web.php';
$cssPath = $root.'/resources/css/app.css';

if (! is_file($routesPath) || ! is_file($cssPath)) {
    fwrite(STDERR, "routes/web.php ou resources/css/app.css introuvable.\n");
    exit(1);
}

$stamp = date('Ymd-His');
copy($routesPath, $routesPath.'.backup-'.$stamp);
copy($cssPath, $cssPath.'.backup-'.$stamp);

$routes = file_get_contents($routesPath);

$routes = preg_replace(
    '/^use App\\\\Http\\\\Controllers\\\\Admin\\\\SettingsController;\R/m',
    '',
    $routes,
);

$routes = preg_replace(
    '/(<\?php\R)/',
    "$1\nuse App\\Http\\Controllers\\Admin\\SettingsController;\n",
    $routes,
    1,
);

if (! str_contains($routes, "name('admin.settings.index')")) {
    $routes .= <<<'PHP'


Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin/settings')
    ->name('admin.settings.')
    ->group(function (): void {
        Route::get('/', [SettingsController::class, 'index'])
            ->name('index');

        Route::patch('/', [SettingsController::class, 'update'])
            ->name('update');
    });

PHP;
}

file_put_contents($routesPath, $routes);

$css = file_get_contents($cssPath);

$marker = '/* ASTREON_ADMIN_SETTINGS_INPUT */';

if (! str_contains($css, $marker)) {
    $css .= <<<'CSS'


/* ASTREON_ADMIN_SETTINGS_INPUT */
@layer components {
    .input {
        @apply h-12 w-full rounded-xl border border-violet-400/15 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-400/40;
    }
}

CSS;
}

file_put_contents($cssPath, $css);

echo "Module Paramètres V13 installé.\n";
echo "Sauvegardes créées avec le suffixe backup-{$stamp}\n\n";

passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan migrate');
passthru(PHP_BINARY.' artisan route:list --path=admin/settings');

echo "\nAdresse : http://127.0.0.1:8000/admin/settings\n";
