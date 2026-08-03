<?php

declare(strict_types=1);

$root = __DIR__;
$routesPath = $root.'/routes/web.php';
$appPath = $root.'/resources/js/app.tsx';

if (! is_file($routesPath) || ! is_file($appPath)) {
    fwrite(STDERR, "routes/web.php ou resources/js/app.tsx introuvable.\n");
    exit(1);
}

$stamp = date('Ymd-His');
copy($routesPath, $routesPath.'.backup-'.$stamp);
copy($appPath, $appPath.'.backup-'.$stamp);

$routes = file_get_contents($routesPath);

/*
 * Alias pratiques. Le menu global peut désormais viser /assistance,
 * /support ou directement /client/support.
 */
if (! str_contains($routes, "name('support.redirect')")) {
    $routes .= <<<'PHP'


Route::middleware(['auth', 'verified'])
    ->get('/assistance', fn () => redirect()->route('client.support.index'))
    ->name('support.redirect');

Route::middleware(['auth', 'verified'])
    ->get('/support', fn () => redirect()->route('client.support.index'));

PHP;
}

file_put_contents($routesPath, $routes);

/*
 * Le layout global du site doit rester actif pour client/support.
 * On supprime toute exception qui forcerait le layout à null.
 */
$app = file_get_contents($appPath);

$app = preg_replace(
    "/\s*case name\.startsWith\(['\"]client\/support['\"]\):\s*return null;/",
    '',
    $app,
);

file_put_contents($appPath, $app);

echo "Correctif Support V6 installé.\n";
echo "Sauvegardes : backup-{$stamp}\n\n";

passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan route:list --path=client/support');

echo "\nPage support : http://127.0.0.1:8000/client/support\n";
echo "Création : http://127.0.0.1:8000/client/support/create\n";
