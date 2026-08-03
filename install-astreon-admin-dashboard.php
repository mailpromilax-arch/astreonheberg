<?php

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

/* Supprime les imports dupliqués. */
$routes = preg_replace(
    '/^use App\\\\Http\\\\Controllers\\\\Admin\\\\AdminDashboardController;\R/m',
    '',
    $routes
);

$routes = preg_replace(
    '/(<\?php\R)/',
    "$1\nuse App\\Http\\Controllers\\Admin\\AdminDashboardController;\n",
    $routes,
    1
);

/* Supprime uniquement les groupes admin vides. */
$routes = preg_replace(
    '/Route::middleware\(\[\s*[\'"]auth[\'"]\s*,\s*[\'"]admin[\'"]\s*\]\)\s*->prefix\([\'"]admin[\'"]\)\s*->group\(function\s*\(\)\s*\{\s*\}\s*\);/s',
    '',
    $routes
);

/* Utilise le middleware admin à la place de la permission non configurée. */
$routes = str_replace(
    "'can:access admin dashboard',",
    "'admin',",
    $routes
);

/* Ajoute la route si aucun groupe nommé admin n'existe. */
if (! str_contains($routes, "->name('admin.')")) {
    $routes .= <<<'PHP'


Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function (): void {
        Route::get('/', [AdminDashboardController::class, 'index'])
            ->name('dashboard');
    });

PHP;
}

file_put_contents($routesPath, $routes);

$app = file_get_contents($appPath);

if (! str_contains($app, "case name.startsWith('admin/'):")) {
    $needle = "case name.startsWith('auth/'):";
    $replacement = "case name.startsWith('admin/'):\n"
        ."                return null;\n"
        ."            ".$needle;

    $app = str_replace($needle, $replacement, $app);
}

file_put_contents($appPath, $app);

echo "Installation terminée.\n";
echo "Sauvegardes : backup-{$stamp}\n\n";

passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan route:list --path=admin');

echo "\nOuvrez : http://127.0.0.1:8000/admin\n";
