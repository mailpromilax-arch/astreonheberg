<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\Payments\PayPalClient;
use App\Services\Pterodactyl\PterodactylClient;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

final class PublicStatusController extends Controller
{
    public function __invoke(
        PterodactylClient $pterodactyl,
        PayPalClient $paypal,
    ): Response {
        $checks = [
            $this->check('website', 'Site et boutique', 'Site public, boutique et espace client.', fn (): bool => true),

            $this->check(
                'database',
                'Base de données',
                'Connexion principale MySQL de la plateforme.',
                function (): bool {
                    DB::select('SELECT 1');
                    return true;
                },
            ),

            $this->check(
                'pterodactyl',
                'Infrastructure Pterodactyl',
                'Panel, API Application et déploiement des serveurs.',
                function () use ($pterodactyl): bool {
                    $response = $pterodactyl->testConnection();
                    return count($response['data'] ?? []) > 0;
                },
            ),

            [
                'key' => 'stripe',
                'label' => 'Paiements Stripe',
                'description' => 'Paiements par carte bancaire.',
                'status' => filled(config('cashier.secret') ?: env('STRIPE_SECRET')) ? 'operational' : 'degraded',
                'message' => filled(config('cashier.secret') ?: env('STRIPE_SECRET')) ? null : 'Stripe n’est pas configuré sur cet environnement.',
            ],

            [
                'key' => 'paypal',
                'label' => 'Paiements PayPal',
                'description' => 'Paiements et rechargements PayPal.',
                'status' => $paypal->configured() ? 'operational' : 'degraded',
                'message' => $paypal->configured() ? null : 'PayPal n’est pas configuré sur cet environnement.',
            ],

            [
                'key' => 'mail',
                'label' => 'Service e-mail',
                'description' => 'Réinitialisation de mot de passe et e-mails transactionnels.',
                'status' => filled(config('mail.default')) && config('mail.default') !== 'log' ? 'operational' : 'degraded',
                'message' => filled(config('mail.default')) && config('mail.default') !== 'log' ? null : 'Le service e-mail utilise un mode local ou de test.',
            ],
        ];

        $overall = collect($checks)->contains(fn (array $check): bool => $check['status'] === 'outage')
            ? 'outage'
            : (collect($checks)->contains(fn (array $check): bool => $check['status'] === 'degraded') ? 'degraded' : 'operational');

        return Inertia::render('public/status', [
            'checkedAt' => now()->toIso8601String(),
            'overall' => $overall,
            'checks' => $checks,
        ]);
    }

    private function check(
        string $key,
        string $label,
        string $description,
        callable $callback,
    ): array {
        try {
            return [
                'key' => $key,
                'label' => $label,
                'description' => $description,
                'status' => $callback() ? 'operational' : 'outage',
                'message' => null,
            ];
        } catch (Throwable $exception) {
            report($exception);

            return [
                'key' => $key,
                'label' => $label,
                'description' => $description,
                'status' => 'outage',
                'message' => app()->environment('local')
                    ? $exception->getMessage()
                    : 'Le service ne répond pas actuellement.',
            ];
        }
    }
}
