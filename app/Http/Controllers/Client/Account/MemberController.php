<?php

declare(strict_types=1);

namespace App\Http\Controllers\Client\Account;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

final class MemberController extends Controller
{
    public function index(Request $request): Response
    {
        $owner = $request->user();

        $members = DB::table('account_members')
            ->where('owner_id', $owner->id)
            ->latest()
            ->get()
            ->map(fn (object $member): array => [
                'id' => $member->id,
                'email' => $member->email,
                'permissions' => json_decode($member->permissions ?? '[]', true),
                'status' => $member->status,
                'last_login_at' => $member->last_login_at,
                'accepted_at' => $member->accepted_at,
            ]);

        return Inertia::render('client/account/members/index', [
            'owner' => $owner->only(['id', 'name', 'email']),
            'members' => $members,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['string', 'in:profile,billing,services,tickets,orders'],
        ]);

        DB::table('account_members')->updateOrInsert(
            [
                'owner_id' => $request->user()->id,
                'email' => mb_strtolower($validated['email']),
            ],
            [
                'permissions' => json_encode(array_values($validated['permissions'])),
                'status' => 'pending',
                'token' => hash('sha256', Str::random(64)),
                'updated_at' => now(),
                'created_at' => DB::raw('COALESCE(created_at, CURRENT_TIMESTAMP)'),
            ],
        );

        return back()->with(
            'success',
            'Invitation enregistrée. L’envoi d’e-mail sera relié au système de notifications.',
        );
    }

    public function destroy(Request $request, int $member): RedirectResponse
    {
        DB::table('account_members')
            ->where('id', $member)
            ->where('owner_id', $request->user()->id)
            ->delete();

        return back()->with('success', 'Accès supprimé.');
    }
}
