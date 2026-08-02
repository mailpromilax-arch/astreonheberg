<?php

namespace App\Http\Middleware;

use App\Models\ServiceApiKey;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateServiceApiKey
{
    public function handle(
        Request $request,
        Closure $next,
        ?string $permission = null,
    ): Response {
        $token = (string) $request->bearerToken();

        if (!preg_match(
            '/^astreon_([A-Za-z0-9]{12})_([A-Za-z0-9]{48})$/',
            $token,
            $matches,
        )) {
            return $this->unauthorized('Clé API absente ou invalide.');
        }

        $prefix = $matches[1];

        $apiKey = ServiceApiKey::query()
            ->with('service')
            ->where('token_prefix', $prefix)
            ->first();

        if (
            !$apiKey
            || !hash_equals(
                $apiKey->token_hash,
                hash('sha256', $token),
            )
            || !$apiKey->isUsable()
        ) {
            return $this->unauthorized(
                'Clé API inconnue, expirée ou révoquée.',
            );
        }

        if ($permission !== null && !$apiKey->allows($permission)) {
            return response()->json([
                'message' => 'Permission API insuffisante.',
                'required_permission' => $permission,
            ], 403);
        }

        $apiKey->markUsed();

        $request->attributes->set('service_api_key', $apiKey);
        $request->attributes->set('service', $apiKey->service);

        return $next($request);
    }

    private function unauthorized(string $message): JsonResponse
    {
        return response()->json([
            'message' => $message,
        ], 401);
    }
}
