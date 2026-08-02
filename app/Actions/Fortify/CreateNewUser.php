<?php

declare(strict_types=1);

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

final class CreateNewUser implements CreatesNewUsers
{
    /**
     * Valide les données d'inscription puis crée le compte client.
     *
     * @param array<string, mixed> $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
            'terms' => ['accepted'],
        ], [
            'name.required' => 'Le nom est obligatoire.',
            'email.required' => 'L’adresse courriel est obligatoire.',
            'email.email' => 'L’adresse courriel est invalide.',
            'email.unique' => 'Cette adresse courriel est déjà utilisée.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
            'terms.accepted' => 'Vous devez accepter les conditions d’utilisation.',
        ])->validate();

        return User::create([
            'name' => trim((string) $input['name']),
            'email' => mb_strtolower(trim((string) $input['email'])),
            'password' => Hash::make((string) $input['password']),
        ]);
    }
}
