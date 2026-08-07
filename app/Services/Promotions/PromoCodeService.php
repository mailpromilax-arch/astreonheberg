<?php

declare(strict_types=1);

namespace App\Services\Promotions;

use App\Models\Order;
use App\Models\PromoCode;
use App\Models\PromoCodeUsage;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class PromoCodeService
{
    public function resolve(
        string $rawCode,
        User $user,
        int $beforeDiscountCents,
    ): PromoCode {
        $code = Str::upper(trim($rawCode));

        $promo = PromoCode::query()
            ->where('code', $code)
            ->first();

        if (! $promo || ! $promo->is_active) {
            $this->invalid('Ce code promo est invalide ou désactivé.');
        }

        if ($promo->starts_at && now()->isBefore($promo->starts_at)) {
            $this->invalid('Ce code promo n’est pas encore actif.');
        }

        if ($promo->ends_at && now()->isAfter($promo->ends_at)) {
            $this->invalid('Ce code promo a expiré.');
        }

        if (
            $promo->usage_limit !== null
            && $promo->used_count >= $promo->usage_limit
        ) {
            $this->invalid('Ce code promo a atteint sa limite d’utilisation.');
        }

        if (
            $beforeDiscountCents
            < (int) $promo->minimum_order_cents
        ) {
            $minimum = number_format(
                $promo->minimum_order_cents / 100,
                2,
                ',',
                ' ',
            );

            $this->invalid(
                "Le montant minimum pour ce code est de {$minimum} €.",
            );
        }

        if (
            $promo->one_per_user
            && PromoCodeUsage::query()
                ->where('promo_code_id', $promo->id)
                ->where('user_id', $user->id)
                ->exists()
        ) {
            $this->invalid('Vous avez déjà utilisé ce code promo.');
        }

        return $promo;
    }

    public function discountCents(
        PromoCode $promo,
        int $beforeDiscountCents,
    ): int {
        $discount = $promo->type === 'percent'
            ? (int) floor(
                $beforeDiscountCents
                * min(100, max(1, $promo->value))
                / 100,
            )
            : max(0, $promo->value);

        if ($promo->maximum_discount_cents !== null) {
            $discount = min(
                $discount,
                $promo->maximum_discount_cents,
            );
        }

        /*
         * Stripe impose un montant minimal pour les paiements EUR.
         * Le code ne peut donc pas faire descendre une commande sous 0,50 €.
         */
        return min(
            $discount,
            max(0, $beforeDiscountCents - 50),
        );
    }

    public function recordUsage(
        int $promoCodeId,
        User $user,
        Order $order,
        int $discountCents,
    ): void {
        DB::transaction(function () use (
            $promoCodeId,
            $user,
            $order,
            $discountCents,
        ): void {
            $promo = PromoCode::query()
                ->lockForUpdate()
                ->findOrFail($promoCodeId);

            $existing = PromoCodeUsage::query()
                ->where('order_id', $order->id)
                ->exists();

            if ($existing) {
                return;
            }

            PromoCodeUsage::query()->create([
                'promo_code_id' => $promo->id,
                'user_id' => $user->id,
                'order_id' => $order->id,
                'discount_cents' => $discountCents,
            ]);

            $promo->increment('used_count');
        }, 3);
    }

    private function invalid(string $message): never
    {
        throw ValidationException::withMessages([
            'code' => $message,
        ]);
    }
}
