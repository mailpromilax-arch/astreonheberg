<?php

declare(strict_types=1);

$root = __DIR__;
$stamp = date('Ymd-His');

$files = [
    'app/Providers/TwoFactorChallengeServiceProvider.php',
    'resources/js/pages/auth/two-factor-challenge.tsx',
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

$providersPath = $root.'/bootstrap/providers.php';

if (! is_file($providersPath)) {
    fwrite(STDERR, "bootstrap/providers.php introuvable.\n");
    exit(1);
}

$providers = file_get_contents($providersPath);
copy($providersPath, $providersPath.'.backup-'.$stamp);

$providerClass = '\\App\\Providers\\TwoFactorChallengeServiceProvider::class';

if (! str_contains($providers, $providerClass)) {
    $position = strrpos($providers, '];');

    if ($position === false) {
        fwrite(STDERR, "Format de bootstrap/providers.php non reconnu.\n");
        exit(1);
    }

    $providers = substr($providers, 0, $position)
        ."    {$providerClass},\n"
        .substr($providers, $position);

    file_put_contents($providersPath, $providers);
}

echo "\nNettoyage des caches...\n";
passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan route:list --path=two-factor-challenge');

echo "\nCorrectif 2FA V19 installé.\n";
echo "La page de challenge est maintenant reliée à Fortify.\n";
