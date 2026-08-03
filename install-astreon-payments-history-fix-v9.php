<?php

declare(strict_types=1);

$root = __DIR__;
$routesPath = $root.'/routes/web.php';

if (! is_file($routesPath)) {
    fwrite(STDERR, "routes/web.php introuvable.\n");
    exit(1);
}

$stamp = date('Ymd-His');
copy($routesPath, $routesPath.'.backup-'.$stamp);

$routes = file_get_contents($routesPath);

/*
 * La route existante utilise probablement whereNumber('payment').
 * Les nouvelles références sont payment-12 et order-34.
 */
$routes = str_replace(
    "->whereNumber('payment')",
    "->where('payment', '(payment|order)-[0-9]+|[0-9]+')",
    $routes,
);

file_put_contents($routesPath, $routes);

echo "Correctif historique Paiements V9 installé.\n";
echo "Sauvegarde routes : web.php.backup-{$stamp}\n\n";

passthru(PHP_BINARY.' artisan optimize:clear');
passthru(PHP_BINARY.' artisan route:list --path=admin/payments');

echo "\nAdresse : http://127.0.0.1:8000/admin/payments\n";
