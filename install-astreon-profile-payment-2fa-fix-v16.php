<?php

declare(strict_types=1);

$root = __DIR__;

$required = [
    'app/Models/User.php',
    'app/Http/Controllers/Client/Account/ProfileController.php',
    'app/Http/Controllers/Client/Account/PaymentMethodController.php',
    'app/Http/Controllers/Client/Account/SecurityController.php',
    'app/Http/Controllers/Admin/UserController.php',
    'resources/js/pages/client/account/security/index.tsx',
    'resources/js/pages/admin/users/show.tsx',
];

$stamp = date('Ymd-His');

foreach ($required as $relative) {
    $source = __DIR__.'/'.$relative;
    $target = $root.'/'.$relative;

    if (! is_file($source)) {
        fwrite(STDERR, "Source absente : {$relative}\n");
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

echo "\nSauvegardes créées avec le suffixe backup-{$stamp}\n\n";

passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan route:list --path=client/account');
passthru(PHP_BINARY.' artisan route:list --path=settings/security');

echo "\nCorrectifs installés.\n";
echo "Profil : http://127.0.0.1:8000/client/account\n";
echo "Paiements : http://127.0.0.1:8000/client/account/payment-methods\n";
echo "Sécurité : http://127.0.0.1:8000/client/account/security\n";
