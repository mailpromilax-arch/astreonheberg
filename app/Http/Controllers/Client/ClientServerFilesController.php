<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Services\Pterodactyl\PterodactylClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Throwable;

class ClientServerFilesController extends Controller
{
    public function index(Request $request, Service $service, PterodactylClient $client): JsonResponse
    {
        $identifier = $this->identifier($request, $service);
        $directory = $this->normalize((string) $request->query('directory', '/'));

        try {
            $response = $client->listServerFiles($identifier, $directory);

            return response()->json([
                'directory' => $directory,
                'files' => collect(data_get($response, 'data', []))
                    ->map(function (array $item): array {
                        $attributes = data_get($item, 'attributes', []);

                        return [
                            'name' => (string) data_get($attributes, 'name'),
                            'size' => (int) data_get($attributes, 'size', 0),
                            'is_file' => (bool) data_get($attributes, 'is_file', false),
                            'is_symlink' => (bool) data_get($attributes, 'is_symlink', false),
                            'is_editable' => (bool) data_get($attributes, 'is_editable', false),
                            'mimetype' => data_get($attributes, 'mimetype'),
                            'modified_at' => data_get($attributes, 'modified_at'),
                        ];
                    })
                    ->values(),
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Impossible de charger les fichiers.',
            ], 502);
        }
    }

    public function contents(Request $request, Service $service, PterodactylClient $client): JsonResponse
    {
        $identifier = $this->identifier($request, $service);
        $validated = $request->validate([
            'file' => ['required', 'string', 'max:4096'],
        ]);

        try {
            $file = $this->normalize($validated['file']);

            return response()->json([
                'file' => $file,
                'content' => $client->readServerFile($identifier, $file),
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Impossible de lire ce fichier.',
            ], 502);
        }
    }

    public function write(Request $request, Service $service, PterodactylClient $client): JsonResponse
    {
        $identifier = $this->identifier($request, $service);
        $validated = $request->validate([
            'file' => ['required', 'string', 'max:4096'],
            'content' => ['present', 'string'],
        ]);

        try {
            $client->writeServerFile(
                $identifier,
                $this->normalize($validated['file']),
                $validated['content'],
            );

            return response()->json(['message' => 'Fichier enregistré.']);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Impossible d’enregistrer le fichier.',
            ], 502);
        }
    }

    public function createFolder(Request $request, Service $service, PterodactylClient $client): JsonResponse
    {
        $identifier = $this->identifier($request, $service);
        $validated = $request->validate([
            'root' => ['required', 'string', 'max:4096'],
            'name' => ['required', 'string', 'max:255', 'not_regex:/[\/\\\\]/'],
        ]);

        try {
            $client->createServerFolder(
                $identifier,
                $this->normalize($validated['root']),
                $validated['name'],
            );

            return response()->json(['message' => 'Dossier créé.'], 201);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Impossible de créer le dossier.',
            ], 502);
        }
    }

    public function rename(Request $request, Service $service, PterodactylClient $client): JsonResponse
    {
        $identifier = $this->identifier($request, $service);
        $validated = $request->validate([
            'root' => ['required', 'string', 'max:4096'],
            'from' => ['required', 'string', 'max:255'],
            'to' => ['required', 'string', 'max:255', 'not_regex:/[\/\\\\]/'],
        ]);

        try {
            $client->renameServerFile(
                $identifier,
                $this->normalize($validated['root']),
                $validated['from'],
                $validated['to'],
            );

            return response()->json(['message' => 'Élément renommé.']);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Impossible de renommer cet élément.',
            ], 502);
        }
    }

    public function destroy(Request $request, Service $service, PterodactylClient $client): JsonResponse
    {
        $identifier = $this->identifier($request, $service);
        $validated = $request->validate([
            'root' => ['required', 'string', 'max:4096'],
            'files' => ['required', 'array', 'min:1', 'max:100'],
            'files.*' => ['required', 'string', 'max:255'],
        ]);

        try {
            $client->deleteServerFiles(
                $identifier,
                $this->normalize($validated['root']),
                $validated['files'],
            );

            return response()->json(['message' => 'Élément supprimé.']);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Impossible de supprimer cet élément.',
            ], 502);
        }
    }

    public function download(Request $request, Service $service, PterodactylClient $client): JsonResponse
    {
        $identifier = $this->identifier($request, $service);
        $validated = $request->validate([
            'file' => ['required', 'string', 'max:4096'],
        ]);

        try {
            $response = $client->getServerFileDownload(
                $identifier,
                $this->normalize($validated['file']),
            );

            return response()->json([
                'url' => (string) data_get(
                    $response,
                    'attributes.url',
                    data_get($response, 'data.attributes.url'),
                ),
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Impossible de préparer le téléchargement.',
            ], 502);
        }
    }

    public function upload(Request $request, Service $service, PterodactylClient $client): JsonResponse
    {
        $identifier = $this->identifier($request, $service);

        try {
            $response = $client->getServerFileUpload($identifier);

            return response()->json([
                'url' => (string) data_get(
                    $response,
                    'attributes.url',
                    data_get($response, 'data.attributes.url'),
                ),
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Impossible de préparer l’envoi.',
            ], 502);
        }
    }

    private function identifier(Request $request, Service $service): string
    {
        abort_unless(
            (int) $service->user_id === (int) $request->user()->id,
            403,
        );

        $identifier = (string) data_get(
            $service->configuration,
            'pterodactyl.identifier',
        );

        if ($identifier === '') {
            throw ValidationException::withMessages([
                'service' => 'Identifiant Pterodactyl introuvable.',
            ]);
        }

        return $identifier;
    }

    private function normalize(string $path): string
    {
        $path = str_replace('\\', '/', trim($path));
        $segments = [];

        foreach (explode('/', $path) as $segment) {
            if ($segment === '' || $segment === '.') {
                continue;
            }

            if ($segment === '..') {
                array_pop($segments);
                continue;
            }

            $segments[] = $segment;
        }

        return '/'.implode('/', $segments);
    }
}