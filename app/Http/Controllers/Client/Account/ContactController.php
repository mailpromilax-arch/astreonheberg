<?php

declare(strict_types=1);

namespace App\Http\Controllers\Client\Account;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class ContactController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('client/account/contacts/index', [
            'contacts' => DB::table('account_contacts')
                ->where('user_id', $request->user()->id)
                ->latest()
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);

        DB::table('account_contacts')->insert([
            ...$validated,
            'user_id' => $request->user()->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Contact ajouté.');
    }

    public function update(
        Request $request,
        int $contact,
    ): RedirectResponse {
        DB::table('account_contacts')
            ->where('id', $contact)
            ->where('user_id', $request->user()->id)
            ->update([
                ...$this->validated($request),
                'updated_at' => now(),
            ]);

        return back()->with('success', 'Contact mis à jour.');
    }

    public function destroy(
        Request $request,
        int $contact,
    ): RedirectResponse {
        DB::table('account_contacts')
            ->where('id', $contact)
            ->where('user_id', $request->user()->id)
            ->delete();

        return back()->with('success', 'Contact supprimé.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'company_name' => ['nullable', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address_line_1' => ['nullable', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'region' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:30'],
            'country' => ['nullable', 'string', 'max:100'],
            'general_emails' => ['required', 'boolean'],
            'billing_emails' => ['required', 'boolean'],
            'support_emails' => ['required', 'boolean'],
            'is_default_billing' => ['required', 'boolean'],
        ]);
    }
}
