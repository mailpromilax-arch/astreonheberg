<?php

declare(strict_types=1);

$root = __DIR__;
$target = $root.'/resources/js/layouts/client-layout.tsx';

if (! is_file($target)) {
    fwrite(STDERR, "resources/js/layouts/client-layout.tsx introuvable.\n");
    exit(1);
}

$stamp = date('Ymd-His');
copy($target, $target.'.backup-'.$stamp);

$source = __DIR__.'/resources/js/layouts/client-layout.tsx';
copy($source, $target);

echo "Menu client V15 installé.\n";
echo "Sauvegarde : client-layout.tsx.backup-{$stamp}\n";

passthru(PHP_BINARY.' artisan optimize:clear');

echo "\nLancez ensuite : npm run build\n";
