<?php

declare(strict_types=1);

$root = __DIR__;
$stamp = date('Ymd-His');

$files = [
    'app/Providers/NotificationCenterServiceProvider.php',
    'database/migrations/2026_08_03_130000_create_notification_database_triggers.php',
    'resources/js/components/notifications/notification-bell.tsx',
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
 * Remplace avec certitude la cloche statique connue du layout client.
 */
$clientPath = $root.'/resources/js/layouts/client-layout.tsx';

if (is_file($clientPath)) {
    $client = file_get_contents($clientPath);
    copy($clientPath, $clientPath.'.backup-'.$stamp);

    if (! str_contains($client, "components/notifications/notification-bell")) {
        $client = preg_replace(
            "/(import AstreonLogo[^;]+;\R)/",
            "$1import NotificationBell from '@/components/notifications/notification-bell';\n",
            $client,
            1,
        );
    }

    $patterns = [
        '/<span className="relative">\s*<Bell className="h-4 w-4"\s*\/>\s*<span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-orange-500 text-\[9px\] text-white">1<\/span>\s*<\/span>/s',
        '/<span className="relative">\s*<Bell className="h-4 w-4"\s*\/>\s*<span[^>]*>1<\/span>\s*<\/span>/s',
    ];

    foreach ($patterns as $pattern) {
        $client = preg_replace(
            $pattern,
            '<NotificationBell variant="client" />',
            $client,
            1,
        );
    }

    file_put_contents($clientPath, $client);
}

/*
 * Remplace les cloches statiques de tous les shells admin.
 */
$adminRoot = $root.'/resources/js';

$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator(
        $adminRoot,
        FilesystemIterator::SKIP_DOTS,
    ),
);

foreach ($iterator as $file) {
    if (
        ! $file->isFile()
        || ! in_array(
            strtolower($file->getExtension()),
            ['tsx', 'jsx'],
            true,
        )
    ) {
        continue;
    }

    $path = $file->getPathname();
    $content = file_get_contents($path);

    if (
        ! str_contains($content, 'ASTREON')
        || ! str_contains($content, '<Bell')
        || str_contains($content, '<NotificationBell')
    ) {
        continue;
    }

    copy($path, $path.'.backup-'.$stamp);

    if (! str_contains($content, "components/notifications/notification-bell")) {
        $content = preg_replace(
            '/((?:import .+;\R)+)/',
            "$1import NotificationBell from '@/components/notifications/notification-bell';\n",
            $content,
            1,
        );
    }

    $content = preg_replace(
        '/<button\b[^>]*>\s*<Bell\b[^>]*\/>\s*(?:<span\b[^>]*\/?>.*?<\/span>|<span\b[^>]*\/>)?\s*<\/button>/s',
        '<NotificationBell variant="admin" />',
        $content,
        1,
    );

    file_put_contents($path, $content);
}

echo "\nMigration des triggers...\n";
passthru(PHP_BINARY.' artisan migrate');
passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan route:list --path=notification');

echo "\nDiagnostic notifications :\n";
passthru(
    PHP_BINARY
    .' artisan tinker --execute="dump(['
    ."'table' => Schema::hasTable('platform_notifications'), "
    ."'notifications' => DB::table('platform_notifications')->count(), "
    ."'unread' => DB::table('platform_notifications')->whereNull('read_at')->count()"
    .']);"'
);

echo "\nCorrectif notifications V23 installé.\n";
echo "Exécutez composer dump-autoload puis npm run build.\n";
