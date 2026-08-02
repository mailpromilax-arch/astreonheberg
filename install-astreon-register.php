<?php

declare(strict_types=1);

$projectRoot = __DIR__;
$configPath = $projectRoot . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'fortify.php';

if (!is_file($configPath)) {
    fwrite(STDERR, "ERREUR : config/fortify.php est introuvable.\n");
    exit(1);
}

$contents = file_get_contents($configPath);

if ($contents === false) {
    fwrite(STDERR, "ERREUR : impossible de lire config/fortify.php.\n");
    exit(1);
}

$backupPath = $configPath . '.backup-' . date('Ymd-His');

if (!copy($configPath, $backupPath)) {
    fwrite(STDERR, "ERREUR : impossible de créer la sauvegarde.\n");
    exit(1);
}

/*
|--------------------------------------------------------------------------
| Active l'inscription Fortify
|--------------------------------------------------------------------------
|
| La route GET /register et la route POST /register sont créées
| automatiquement par Fortify lorsque Features::registration() est active.
|
*/

if (!str_contains($contents, 'use Laravel\\Fortify\\Features;')) {
    $contents = preg_replace(
        '/<\?php\s*/',
        "<?php\n\nuse Laravel\\Fortify\\Features;\n\n",
        $contents,
        1
    );
}

$registrationPattern = '/^[ \t]*\/\/[ \t]*Features::registration\(\),[ \t]*$/m';

if (preg_match($registrationPattern, $contents)) {
    $contents = preg_replace(
        $registrationPattern,
        '        Features::registration(),',
        $contents,
        1
    );
} elseif (!str_contains($contents, 'Features::registration(),')) {
    $featuresPattern = "/'features'\s*=>\s*\[/";

    if (!preg_match($featuresPattern, $contents)) {
        fwrite(
            STDERR,
            "ERREUR : le tableau 'features' est introuvable dans config/fortify.php.\n" .
            "La sauvegarde se trouve ici : {$backupPath}\n"
        );
        exit(1);
    }

    $contents = preg_replace(
        $featuresPattern,
        "'features' => [\n        Features::registration(),",
        $contents,
        1
    );
}

if (file_put_contents($configPath, $contents) === false) {
    fwrite(STDERR, "ERREUR : impossible de modifier config/fortify.php.\n");
    exit(1);
}

echo "Inscription Fortify activée.\n";
echo "Sauvegarde créée : {$backupPath}\n";
echo "Nettoyage des caches Laravel...\n";

passthru(PHP_BINARY . ' artisan optimize:clear', $exitCode);

if ($exitCode !== 0) {
    fwrite(STDERR, "ATTENTION : optimize:clear a retourné le code {$exitCode}.\n");
}

echo "\nVérification des routes register :\n";
passthru(PHP_BINARY . ' artisan route:list --path=register');

echo "\nTerminé. Ouvrez maintenant : http://127.0.0.1:8000/register\n";
