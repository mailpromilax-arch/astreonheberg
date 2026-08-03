<?php

declare(strict_types=1);

$root = __DIR__;
$stamp = date('Ymd-His');

$files = [
    'app/Http/Controllers/Admin/TicketController.php',
    'app/Http/Controllers/Admin/UserController.php',
    'app/Http/Controllers/Admin/UserPaymentMethodController.php',
    'app/Http/Controllers/Client/Account/PaymentMethodController.php',
    'app/Http/Controllers/Client/ClientTicketController.php',
    'app/Notifications/AstreonTransactionalNotification.php',
    'app/Observers/OrderMailObserver.php',
    'app/Observers/ServiceMailObserver.php',
    'app/Observers/UserSecurityMailObserver.php',
    'app/Providers/TransactionalMailServiceProvider.php',
    'app/Services/Mail/AstreonMailer.php',
    'resources/views/emails/astreon.blade.php',
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
$providers = file_get_contents($providersPath);
copy($providersPath, $providersPath.'.backup-'.$stamp);

$provider = '\\App\\Providers\\TransactionalMailServiceProvider::class';

if (! str_contains($providers, $provider)) {
    $position = strrpos($providers, '];');

    if ($position === false) {
        fwrite(STDERR, "Format bootstrap/providers.php non reconnu.\n");
        exit(1);
    }

    $providers = substr($providers, 0, $position)
        ."    {$provider},\n"
        .substr($providers, $position);

    file_put_contents($providersPath, $providers);
}

passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan view:cache');

echo "\nInstallation V26 terminée.\n";
echo "Exécutez composer dump-autoload puis npm run build.\n";
