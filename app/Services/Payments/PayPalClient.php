<?php

declare(strict_types=1);

namespace App\Services\Payments;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

final class PayPalClient
{
    public function configured(): bool
    {
        return filled(config('services.paypal.client_id'))
            && filled(config('services.paypal.client_secret'));
    }

    public function createOrder(
        int $amountCents,
        string $reference,
        string $returnUrl,
        string $cancelUrl,
    ): array {
        $response = $this->request()->post('/v2/checkout/orders', [
            'intent' => 'CAPTURE',
            'purchase_units' => [[
                'reference_id' => $reference,
                'custom_id' => $reference,
                'description' => 'Rechargement portefeuille Astreon',
                'amount' => [
                    'currency_code' => 'EUR',
                    'value' => number_format($amountCents / 100, 2, '.', ''),
                ],
            ]],
            'application_context' => [
                'brand_name' => 'Astreon',
                'landing_page' => 'LOGIN',
                'user_action' => 'PAY_NOW',
                'return_url' => $returnUrl,
                'cancel_url' => $cancelUrl,
            ],
        ])->throw()->json();

        $approvalUrl = collect($response['links'] ?? [])
            ->firstWhere('rel', 'approve')['href'] ?? null;

        if (! is_string($approvalUrl)) {
            throw new RuntimeException(
                'PayPal n’a pas retourné de lien d’approbation.',
            );
        }

        return [
            'id' => $response['id'],
            'approval_url' => $approvalUrl,
            'raw' => $response,
        ];
    }

    public function captureOrder(string $orderId): array
{
    if (! preg_match('/^[A-Z0-9]{1,36}$/', $orderId)) {
        throw new RuntimeException(
            'Identifiant de commande PayPal invalide.',
        );
    }

    return $this->request()
        ->withHeaders([
            'PayPal-Request-Id' => 'capture-'.$orderId,
            'Prefer' => 'return=representation',
        ])
        ->withBody('{}', 'application/json')
        ->send(
            'POST',
            "/v2/checkout/orders/{$orderId}/capture",
        )
        ->throw()
        ->json();
}

    private function request(): PendingRequest
    {
        if (! $this->configured()) {
            throw new RuntimeException(
                'Les identifiants PayPal ne sont pas configurés.',
            );
        }

        return Http::baseUrl($this->baseUrl())
            ->acceptJson()
            ->asJson()
            ->withToken($this->accessToken())
            ->timeout(25)
            ->retry(2, 300);
    }

    private function accessToken(): string
    {
        return Cache::remember(
            'paypal.access_token.'.config('services.paypal.mode', 'sandbox'),
            now()->addMinutes(50),
            function (): string {
                $response = Http::asForm()
                    ->withBasicAuth(
                        (string) config('services.paypal.client_id'),
                        (string) config('services.paypal.client_secret'),
                    )
                    ->post($this->baseUrl().'/v1/oauth2/token', [
                        'grant_type' => 'client_credentials',
                    ])
                    ->throw()
                    ->json();

                return (string) $response['access_token'];
            },
        );
    }

    private function baseUrl(): string
    {
        return config('services.paypal.mode', 'sandbox') === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
    }
}
