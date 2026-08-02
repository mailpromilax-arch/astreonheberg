<?php

declare(strict_types=1);

$root = __DIR__;

$providerPath = $root
    . DIRECTORY_SEPARATOR . 'app'
    . DIRECTORY_SEPARATOR . 'Providers'
    . DIRECTORY_SEPARATOR . 'FortifyServiceProvider.php';

$actionSource = $root
    . DIRECTORY_SEPARATOR . 'app'
    . DIRECTORY_SEPARATOR . 'Actions'
    . DIRECTORY_SEPARATOR . 'Fortify'
    . DIRECTORY_SEPARATOR . 'CreateNewUser.php';

$providersPath = $root
    . DIRECTORY_SEPARATOR . 'bootstrap'
    . DIRECTORY_SEPARATOR . 'providers.php';

if (!is_file($providerPath)) {
    fwrite(
        STDERR,
        "ERREUR : app/Providers/FortifyServiceProvider.php est introuvable.\n"
    );
    exit(1);
}

if (!is_file($actionSource)) {
    fwrite(
        STDERR,
        "ERREUR : app/Actions/Fortify/CreateNewUser.php est introuvable.\n"
    );
    exit(1);
}

/*
|--------------------------------------------------------------------------
| 1. Corrige FortifyServiceProvider
|--------------------------------------------------------------------------
*/

$provider = file_get_contents($providerPath);

if ($provider === false) {
    fwrite(STDERR, "ERREUR : lecture impossible du provider Fortify.\n");
    exit(1);
}

$providerBackup = $providerPath . '.backup-' . date('Ymd-His');

if (!copy($providerPath, $providerBackup)) {
    fwrite(STDERR, "ERREUR : sauvegarde du provider impossible.\n");
    exit(1);
}

if (!str_contains($provider, 'use App\\Actions\\Fortify\\CreateNewUser;')) {
    $provider = preg_replace(
        '/namespace App\\\\Providers;\s*/',
        "namespace App\\Providers;\n\nuse App\\Actions\\Fortify\\CreateNewUser;\n",
        $provider,
        1
    );
}

if (!str_contains($provider, 'use Inertia\\Inertia;')) {
    $provider = preg_replace(
        '/namespace App\\\\Providers;\s*/',
        "namespace App\\Providers;\n\nuse Inertia\\Inertia;\n",
        $provider,
        1
    );
}

if (!str_contains($provider, 'use Laravel\\Fortify\\Fortify;')) {
    $provider = preg_replace(
        '/namespace App\\\\Providers;\s*/',
        "namespace App\\Providers;\n\nuse Laravel\\Fortify\\Fortify;\n",
        $provider,
        1
    );
}

if (!str_contains($provider, "Fortify::registerView(")) {
    $provider = preg_replace(
        '/public function boot\(\): void\s*\{/',
        "public function boot(): void\n    {\n"
        . "        Fortify::registerView(fn () => Inertia::render('auth/register'));\n",
        $provider,
        1
    );
}

/*
 * Remplace une éventuelle ancienne ligne incorrecte, puis garantit
 * l'enregistrement de l'action qui implémente CreatesNewUsers.
 */
$provider = preg_replace(
    '/^[ \t]*Fortify::createUsersUsing\([^;]+;[ \t]*$/m',
    '        Fortify::createUsersUsing(CreateNewUser::class);',
    $provider
);

if (!str_contains(
    $provider,
    'Fortify::createUsersUsing(CreateNewUser::class);'
)) {
    $provider = preg_replace(
        '/public function boot\(\): void\s*\{/',
        "public function boot(): void\n    {\n"
        . "        Fortify::createUsersUsing(CreateNewUser::class);\n",
        $provider,
        1
    );
}

if (file_put_contents($providerPath, $provider) === false) {
    fwrite(STDERR, "ERREUR : écriture du provider impossible.\n");
    exit(1);
}

/*
|--------------------------------------------------------------------------
| 2. Vérifie que FortifyServiceProvider est chargé
|--------------------------------------------------------------------------
*/

if (is_file($providersPath)) {
    $providers = file_get_contents($providersPath);

    if ($providers === false) {
        fwrite(STDERR, "ERREUR : lecture de bootstrap/providers.php impossible.\n");
        exit(1);
    }

    if (!str_contains(
        $providers,
        'App\\Providers\\FortifyServiceProvider::class'
    )) {
        $providersBackup = $providersPath . '.backup-' . date('Ymd-His');
        copy($providersPath, $providersBackup);

        $providers = preg_replace(
            '/return\s*\[/',
            "return [\n    App\\Providers\\FortifyServiceProvider::class,",
            $providers,
            1
        );

        file_put_contents($providersPath, $providers);

        echo "FortifyServiceProvider ajouté à bootstrap/providers.php.\n";
        echo "Sauvegarde : {$providersBackup}\n";
    }
}

echo "Action CreateNewUser installée.\n";
echo "Provider Fortify corrigé.\n";
echo "Sauvegarde : {$providerBackup}\n\n";

echo "Nettoyage des caches Laravel...\n";
passthru(PHP_BINARY . ' artisan optimize:clear', $clearCode);

echo "\nVérification de la syntaxe PHP...\n";
passthru(
    PHP_BINARY
    . ' -l app/Actions/Fortify/CreateNewUser.php',
    $actionLint
);
passthru(
    PHP_BINARY
    . ' -l app/Providers/FortifyServiceProvider.php',
    $providerLint
);

if ($actionLint !== 0 || $providerLint !== 0) {
    fwrite(
        STDERR,
        "\nERREUR : une erreur de syntaxe PHP a été détectée.\n"
    );
    exit(1);
}

echo "\nVérification des routes d'inscription...\n";
passthru(PHP_BINARY . ' artisan route:list --path=register');

echo "\nCorrectif terminé.\n";
echo "Redémarrez php artisan serve puis créez le compte à nouveau.\n";
