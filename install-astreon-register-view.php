<?php

declare(strict_types=1);

$root = __DIR__;
$provider = $root . DIRECTORY_SEPARATOR . 'app' . DIRECTORY_SEPARATOR . 'Providers' . DIRECTORY_SEPARATOR . 'FortifyServiceProvider.php';

if (!is_file($provider)) {
    fwrite(STDERR, "ERREUR : app/Providers/FortifyServiceProvider.php est introuvable.\n");
    exit(1);
}

$contents = file_get_contents($provider);

if ($contents === false) {
    fwrite(STDERR, "ERREUR : impossible de lire FortifyServiceProvider.php.\n");
    exit(1);
}

$backup = $provider . '.backup-' . date('Ymd-His');

if (!copy($provider, $backup)) {
    fwrite(STDERR, "ERREUR : impossible de créer la sauvegarde.\n");
    exit(1);
}

if (!str_contains($contents, 'use Inertia\\Inertia;')) {
    $contents = preg_replace(
        '/namespace App\\\\Providers;\s*/',
        "namespace App\\Providers;\n\nuse Inertia\\Inertia;\n",
        $contents,
        1
    );
}

if (!str_contains($contents, 'use Laravel\\Fortify\\Fortify;')) {
    $contents = preg_replace(
        '/namespace App\\\\Providers;\s*/',
        "namespace App\\Providers;\n\nuse Laravel\\Fortify\\Fortify;\n",
        $contents,
        1
    );
}

$registerViewLine = "        Fortify::registerView(fn () => Inertia::render('auth/register'));";

if (!str_contains($contents, "Fortify::registerView(")) {
    if (preg_match('/public function boot\(\): void\s*\{/', $contents)) {
        $contents = preg_replace(
            '/public function boot\(\): void\s*\{/',
            "public function boot(): void\n    {\n{$registerViewLine}",
            $contents,
            1
        );
    } else {
        fwrite(
            STDERR,
            "ERREUR : méthode boot(): void introuvable dans FortifyServiceProvider.php.\n" .
            "Sauvegarde : {$backup}\n"
        );
        exit(1);
    }
}

if (file_put_contents($provider, $contents) === false) {
    fwrite(STDERR, "ERREUR : impossible de modifier FortifyServiceProvider.php.\n");
    exit(1);
}

echo "Vue d'inscription Fortify reliée à Inertia.\n";
echo "Sauvegarde créée : {$backup}\n\n";

echo "Nettoyage des caches Laravel...\n";
passthru(PHP_BINARY . ' artisan optimize:clear', $exitCode);

echo "\nVérification de la route /register...\n";
passthru(PHP_BINARY . ' artisan route:list --path=register');

echo "\nTerminé.\n";
echo "Ouvrez : http://127.0.0.1:8000/register\n";
