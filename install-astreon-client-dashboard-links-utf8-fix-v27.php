<?php

declare(strict_types=1);

$root = __DIR__;
$source = __DIR__.'/resources/js/pages/client/dashboard.tsx';
$target = $root.'/resources/js/pages/client/dashboard.tsx';
$stamp = date('Ymd-His');

if (! is_file($source)) {
    fwrite(STDERR, "Fichier source dashboard.tsx introuvable.\n");
    exit(1);
}

if (! is_dir(dirname($target))) {
    mkdir(dirname($target), 0775, true);
}

if (is_file($target)) {
    copy($target, $target.'.backup-'.$stamp);
}

copy($source, $target);

echo "Dashboard client restauré en UTF-8 propre.\n";
echo "Liens corrigés :\n";
echo "- Modifier mon profil -> /client/account\n";
echo "- Sécurité et 2FA -> /client/account/security\n\n";

passthru(PHP_BINARY.' artisan optimize:clear');

echo "\nExécutez maintenant : npm run build\n";
