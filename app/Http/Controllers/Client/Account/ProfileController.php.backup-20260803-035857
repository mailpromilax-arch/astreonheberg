<?php

declare(strict_types=1);

namespace App\Http\Controllers\Client\Account;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

final class ProfileController extends Controller
{
    public function index(Request $request): Response
    {
        $user = DB::table('users')
            ->where('id', $request->user()->id)
            ->first();

        abort_if($user === null, 404);

        return Inertia::render('client/account/profile/index', [
            'profile' => collect((array) $user)
                ->only([
                    'id',
                    'name',
                    'email',
                    'first_name',
                    'last_name',
                    'company_name',
                    'address_line_1',
                    'address_line_2',
                    'city',
                    'region',
                    'postal_code',
                    'country',
                    'phone',
                    'locale',
                    'marketing_emails',
                    'billing_emails',
                    'support_emails',
                ])
                ->all(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $userId = (int) $request->user()->id;

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'company_name' => ['nullable', 'string', 'max:150'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'address_line_1' => ['nullable', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'region' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:30'],
            'country' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:50'],
            'locale' => ['required', Rule::in(['fr', 'en'])],
            'marketing_emails' => ['required', 'boolean'],
            'billing_emails' => ['required', 'boolean'],
            'support_emails' => ['required', 'boolean'],
        ]);

        $currentEmail = (string) DB::table('users')
            ->where('id', $userId)
            ->value('email');

        $payload = [
            ...$validated,
            'name' => trim(
                $validated['first_name'].' '.$validated['last_name'],
            ),
            'marketing_emails' => (bool) $validated['marketing_emails'],
            'billing_emails' => (bool) $validated['billing_emails'],
            'support_emails' => (bool) $validated['support_emails'],
            'updated_at' => now(),
        ];

        if ($currentEmail !== $validated['email']) {
            $payload['email_verified_at'] = null;
        }

        DB::table('users')
            ->where('id', $userId)
            ->update($payload);

        return redirect()
            ->route('client.account.profile')
            ->with('success', 'Vos informations ont bien été enregistrées.');
    }
}
