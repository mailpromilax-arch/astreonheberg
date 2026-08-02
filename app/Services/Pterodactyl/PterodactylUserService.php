<?php

namespace App\Services\Pterodactyl;

use App\Models\User;
use Illuminate\Support\Str;

class PterodactylUserService
{
    public function __construct(
        private readonly PterodactylClient $client,
    ) {
    }

    /**
     * @return array{
     *     user: array<string, mixed>,
     *     temporary_password: string|null
     * }
     */
    public function findOrCreate(User $user): array
    {
        $externalId = "astreon-user-{$user->id}";

        $existingUser = $this->client
            ->findUserByExternalId($externalId);

        if ($existingUser !== null) {
            return [
                'user' => $existingUser,
                'temporary_password' => null,
            ];
        }

        $existingByEmail = $this->client
            ->findUserByEmail($user->email);

        if ($existingByEmail !== null) {
            return [
                'user' => $existingByEmail,
                'temporary_password' => null,
            ];
        }

        [$firstName, $lastName] = $this->splitName(
            $user->name,
        );

        $temporaryPassword = Str::password(
            length: 20,
            letters: true,
            numbers: true,
            symbols: false,
        );

        $response = $this->client->createUser([
            'external_id' => $externalId,
            'email' => $user->email,
            'username' => $this->username($user),
            'first_name' => $firstName,
            'last_name' => $lastName,
            'password' => $temporaryPassword,
            'language' => 'fr',
            'root_admin' => false,
        ]);

        return [
            'user' => $response,
            'temporary_password' => $temporaryPassword,
        ];
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function splitName(string $name): array
    {
        $parts = preg_split(
            '/\s+/',
            trim($name),
            2,
        );

        $firstName = $parts[0] ?: 'Client';
        $lastName = $parts[1] ?? 'Astreon';

        return [$firstName, $lastName];
    }

    private function username(User $user): string
    {
        $base = Str::of($user->name)
            ->ascii()
            ->lower()
            ->replaceMatches('/[^a-z0-9_]/', '')
            ->limit(20, '')
            ->toString();

        if ($base === '') {
            $base = 'client';
        }

        return $base.'_'.$user->id;
    }
}