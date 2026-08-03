<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Wallet\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

final class UserWalletController extends Controller
{
    public function adjust(
        Request $request,
        User $user,
        WalletService $wallets,
    ): RedirectResponse {
        $validated = $request->validate([
            'operation' => [
                'required',
                Rule::in(['credit', 'debit']),
            ],
            'amount_cents' => [
                'required',
                'integer',
                'min:1',
                'max:10000000',
            ],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $method = $validated['operation'];

        $transaction = $wallets->{$method}(
            $user,
            $validated['amount_cents'],
            'admin_adjustment',
            'admin',
            'admin-wallet:'.str()->uuid(),
            $validated['reason'],
            $request->user()->id,
            [
                'admin_email' => $request->user()->email,
            ],
        );

        activity()
            ->causedBy($request->user())
            ->performedOn($user)
            ->event('wallet_adjusted')
            ->withProperties([
                'operation' => $method,
                'amount_cents' => $validated['amount_cents'],
                'balance_after_cents' => $transaction->balance_after_cents,
                'reason' => $validated['reason'],
            ])
            ->log('Solde du portefeuille client modifié.');

        return back()->with(
            'success',
            'Le portefeuille du client a été mis à jour.',
        );
    }
}
