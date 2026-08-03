<?php

declare(strict_types=1);

$root = __DIR__;
$stamp = date('Ymd-His');

$bellSource = __DIR__.'/resources/js/components/notifications/notification-bell.tsx';
$bellTarget = $root.'/resources/js/components/notifications/notification-bell.tsx';

if (! is_file($bellSource)) {
    fwrite(STDERR, "Composant NotificationBell introuvable.\n");
    exit(1);
}

if (! is_dir(dirname($bellTarget))) {
    mkdir(dirname($bellTarget), 0775, true);
}

if (is_file($bellTarget)) {
    copy($bellTarget, $bellTarget.'.backup-'.$stamp);
}

copy($bellSource, $bellTarget);
echo "Installé : resources/js/components/notifications/notification-bell.tsx\n";

$layoutPath = $root.'/resources/js/layouts/client-layout.tsx';

if (! is_file($layoutPath)) {
    fwrite(STDERR, "Layout client introuvable : {$layoutPath}\n");
    exit(1);
}

$layout = file_get_contents($layoutPath);
copy($layoutPath, $layoutPath.'.backup-'.$stamp);

/*
 * 1. Ajoute l'import NotificationBell une seule fois.
 */
if (! str_contains(
    $layout,
    "components/notifications/notification-bell"
)) {
    if (preg_match(
        "/import AstreonLogo[^;]+;\R/",
        $layout,
        $match
    )) {
        $layout = str_replace(
            $match[0],
            $match[0]
            ."import NotificationBell from '@/components/notifications/notification-bell';\n",
            $layout,
        );
    } else {
        $layout = preg_replace(
            '/((?:import .+;\R)+)/',
            "$1import NotificationBell from '@/components/notifications/notification-bell';\n",
            $layout,
            1,
        );
    }
}

/*
 * 2. Retire les anciennes cloches statiques du bandeau supérieur.
 */
$patterns = [
    '/<span className="relative">\s*<Bell\b[^>]*\/>\s*<span\b[^>]*>.*?<\/span>\s*<\/span>/s',
    '/<button\b[^>]*>\s*<Bell\b[^>]*\/>\s*(?:<span\b[^>]*>.*?<\/span>|<span\b[^>]*\/>)?\s*<\/button>/s',
    '/<div\b[^>]*>\s*<Bell\b[^>]*\/>\s*(?:<span\b[^>]*>.*?<\/span>|<span\b[^>]*\/>)?\s*<\/div>/s',
];

foreach ($patterns as $pattern) {
    $layout = preg_replace($pattern, '', $layout);
}

/*
 * 3. Supprime les anciennes instances NotificationBell du layout afin
 *    de repartir avec exactement une seule cloche fonctionnelle.
 */
$layout = preg_replace(
    '/\s*<NotificationBell\s+variant="client"\s*\/>\s*/',
    "\n",
    $layout,
);

/*
 * 4. Place la nouvelle cloche juste avant le panier principal.
 */
$cartNeedles = [
    '<Link
                                href="/panier"',
    '<Link href="/panier"',
];

$inserted = false;

foreach ($cartNeedles as $needle) {
    $position = strpos($layout, $needle);

    if ($position !== false) {
        $layout = substr($layout, 0, $position)
            ."                            <NotificationBell variant=\"client\" />\n"
            .substr($layout, $position);

        $inserted = true;
        break;
    }
}

/*
 * Solution de secours : insertion au début du bloc d'actions du header.
 */
if (! $inserted) {
    $layout = preg_replace(
        '/(<div className="flex items-center gap-3">\R)/',
        "$1                            <NotificationBell variant=\"client\" />\n",
        $layout,
        1,
        $count,
    );

    $inserted = $count > 0;
}

if (! $inserted) {
    fwrite(
        STDERR,
        "Impossible de déterminer automatiquement l'emplacement de la cloche.\n"
    );
    exit(1);
}

/*
 * 5. Retire Bell de l'import lucide-react si elle n'est plus utilisée.
 */
if (
    substr_count($layout, '<Bell') === 0
    && str_contains($layout, 'Bell,')
) {
    $layout = str_replace('Bell, ', '', $layout);
    $layout = str_replace('Bell,', '', $layout);
}

/*
 * 6. Vérifie qu'il reste exactement une cloche client fonctionnelle.
 */
$count = substr_count(
    $layout,
    '<NotificationBell variant="client" />',
);

if ($count !== 1) {
    fwrite(
        STDERR,
        "Échec : {$count} cloche(s) fonctionnelle(s) détectée(s), attendu : 1.\n"
    );
    exit(1);
}

file_put_contents($layoutPath, $layout);

echo "Corrigé : resources/js/layouts/client-layout.tsx\n";
echo "Une seule cloche client fonctionnelle est maintenant installée.\n\n";

passthru(PHP_BINARY.' artisan optimize:clear');

echo "\nExécutez maintenant : npm run build\n";
