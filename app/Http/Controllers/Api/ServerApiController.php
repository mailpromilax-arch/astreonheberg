<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ServerApiController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $service = $this->resolveService($request);

        if ($service === null) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun service associé à cette clé API.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $service,
        ]);
    }

    public function resources(Request $request): JsonResponse
    {
        $service = $this->resolveService($request);

        if ($service === null) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun service associé à cette clé API.',
            ], 404);
        }

        return response()->json([
            'success' => false,
            'message' => 'La récupération des ressources Pterodactyl doit encore être reliée au service.',
            'service_id' => $this->serviceId($service),
        ], 501);
    }

    public function power(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'signal' => [
                'required',
                'string',
                'in:start,stop,restart,kill',
            ],
        ]);

        $service = $this->resolveService($request);

        if ($service === null) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun service associé à cette clé API.',
            ], 404);
        }

        return response()->json([
            'success' => false,
            'message' => 'La commande d’alimentation Pterodactyl doit encore être reliée.',
            'signal' => $validated['signal'],
            'service_id' => $this->serviceId($service),
        ], 501);
    }

    public function command(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'command' => [
                'required',
                'string',
                'max:2000',
            ],
        ]);

        $service = $this->resolveService($request);

        if ($service === null) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun service associé à cette clé API.',
            ], 404);
        }

        return response()->json([
            'success' => false,
            'message' => 'L’envoi de commandes Pterodactyl doit encore être relié.',
            'command' => $validated['command'],
            'service_id' => $this->serviceId($service),
        ], 501);
    }

    private function resolveService(Request $request): mixed
    {
        foreach ([
            'service',
            'authenticated_service',
            'server',
        ] as $attribute) {
            $service = $request->attributes->get($attribute);

            if ($service !== null) {
                return $service;
            }
        }

        return null;
    }

    private function serviceId(mixed $service): int|string|null
    {
        if (is_object($service) && isset($service->id)) {
            return $service->id;
        }

        if (is_array($service)) {
            return $service['id'] ?? null;
        }

        return null;
    }
}
