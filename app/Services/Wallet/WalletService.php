<?php

declare(strict_types=1);

namespace App\Services\Wallet;

use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class WalletService
{
    public function walletFor(User|int $user): Wallet
    {
        $userId = $user instanceof User ? $user->id : $user;

        return Wallet::query()->firstOrCreate(
            ['user_id' => $userId],
            ['balance_cents' => 0, 'currency' => 'EUR'],
        );
    }

    public function credit(
        User|int $user,
        int $amountCents,
        string $type,
        string $source,
        ?string $reference = null,
        ?string $description = null,
        ?int $actorId = null,
        array $metadata = [],
    ): WalletTransaction {
        if ($amountCents <= 0) {
            throw ValidationException::withMessages([
                'amount' => 'Le montant du crédit doit être supérieur à zéro.',
            ]);
        }

        return $this->change(
            $user,
            $amountCents,
            'credit',
            $type,
            $source,
            $reference,
            $description,
            $actorId,
            $metadata,
        );
    }

    public function debit(
        User|int $user,
        int $amountCents,
        string $type,
        string $source,
        ?string $reference = null,
        ?string $description = null,
        ?int $actorId = null,
        array $metadata = [],
    ): WalletTransaction {
        if ($amountCents <= 0) {
            throw ValidationException::withMessages([
                'wallet' => 'Le montant du débit doit être supérieur à zéro.',
            ]);
        }

        return $this->change(
            $user,
            $amountCents,
            'debit',
            $type,
            $source,
            $reference,
            $description,
            $actorId,
            $metadata,
        );
    }

    private function change(
        User|int $user,
        int $amountCents,
        string $direction,
        string $type,
        string $source,
        ?string $reference,
        ?string $description,
        ?int $actorId,
        array $metadata,
    ): WalletTransaction {
        $userId = $user instanceof User ? $user->id : $user;

        return DB::transaction(function () use (
            $userId,
            $amountCents,
            $direction,
            $type,
            $source,
            $reference,
            $description,
            $actorId,
            $metadata,
        ): WalletTransaction {
            if ($reference !== null) {
                $existing = WalletTransaction::query()
                    ->where('reference', $reference)
                    ->first();

                if ($existing !== null) {
                    return $existing;
                }
            }

            Wallet::query()->firstOrCreate(
                ['user_id' => $userId],
                ['balance_cents' => 0, 'currency' => 'EUR'],
            );

            $wallet = Wallet::query()
                ->where('user_id', $userId)
                ->lockForUpdate()
                ->firstOrFail();

            $before = (int) $wallet->balance_cents;
            $after = $direction === 'credit'
                ? $before + $amountCents
                : $before - $amountCents;

            if ($after < 0) {
                throw ValidationException::withMessages([
                    'wallet' => 'Le solde du portefeuille est insuffisant.',
                ]);
            }

            $wallet->forceFill([
                'balance_cents' => $after,
            ])->save();

            return WalletTransaction::query()->create([
                'wallet_id' => $wallet->id,
                'user_id' => $userId,
                'actor_id' => $actorId,
                'direction' => $direction,
                'type' => $type,
                'source' => $source,
                'status' => 'completed',
                'amount_cents' => $amountCents,
                'balance_before_cents' => $before,
                'balance_after_cents' => $after,
                'reference' => $reference,
                'description' => $description,
                'metadata' => $metadata,
            ]);
        }, 3);
    }
}
