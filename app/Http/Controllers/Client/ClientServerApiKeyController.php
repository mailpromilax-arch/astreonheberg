<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceApiKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ClientServerApiKeyController extends Controller
{
    private const PERMISSIONS = [
        'server.read',
        'resources.read',
        'power.write',
        'console.write',
    ];

    public function index(
        Request $request,
        Service $service,
    ): JsonResponse {
        $this->authorizeOwner($request, $service);

        return response()->json([
            'keys' => $service->apiKeys()
                ->latest()
                ->get()
                ->map(fn (ServiceApiKey $key): array => [
                    'id' => $key->id,
                    'name' => $key->name,
                    'token_prefix' => $key->token_prefix,
                    'permissions' => $key->permissions,
                    'last_used_at' => $key->last_used_at?->toIso8601String(),
                    'expires_at' => $key->expires_at?->toIso8601String(),
                    'revoked_at' => $key->revoked_at?->toIso8601String(),
                    'created_at' => $key->created_at?->toIso8601String(),
                    'is_usable' => $key->isUsable(),
                ])
                ->values(),
            'available_permissions' => self::PERMISSIONS,
            'base_url' => url('/api/v1/server'),
        ]);
    }

    public function store(
        Request $request,
        Service $service,
    ): JsonResponse {
        $this->authorizeOwner($request, $service);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => [
                'string',
                Rule::in(self::PERMISSIONS),
            ],
            'expires_at' => [
                'nullable',
                'date',
                'after:now',
            ],
        ]);

        $prefix = Str::random(12);
        $secret = Str::random(48);
        $plainToken = "astreon_{$prefix}_{$secret}";

        $key = $service->apiKeys()->create([
            'user_id' => $request->user()->id,
            'name' => trim($validated['name']),
            'token_prefix' => $prefix,
            'token_hash' => hash('sha256', $plainToken),
            'permissions' => array_values(array_unique(
                $validated['permissions'],
            )),
            'expires_at' => $validated['expires_at'] ?? null,
        ]);

        return response()->json([
            'message' => 'Clé API créée. Copie-la maintenant.',
            'token' => $plainToken,
            'key' => [
                'id' => $key->id,
                'name' => $key->name,
                'token_prefix' => $key->token_prefix,
                'permissions' => $key->permissions,
                'expires_at' => $key->expires_at?->toIso8601String(),
                'created_at' => $key->created_at?->toIso8601String(),
                'is_usable' => true,
            ],
        ], 201);
    }

    public function destroy(
        Request $request,
        Service $service,
        ServiceApiKey $apiKey,
    ): JsonResponse {
        $this->authorizeOwner($request, $service);

        abort_unless(
            (int) $apiKey->service_id === (int) $service->id,
            404,
        );

        $apiKey->forceFill([
            'revoked_at' => now(),
        ])->save();

        return response()->json([
            'message' => 'Clé API révoquée.',
        ]);
    }

    private function authorizeOwner(
        Request $request,
        Service $service,
    ): void {
        abort_unless(
            (int) $service->user_id === (int) $request->user()->id,
            403,
        );
    }
}
