<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class PromoCodeUsage extends Model
{
    protected $fillable = [
        'promo_code_id',
        'user_id',
        'order_id',
        'discount_cents',
    ];

    protected function casts(): array
    {
        return [
            'discount_cents' => 'integer',
        ];
    }

    public function promoCode(): BelongsTo
    {
        return $this->belongsTo(PromoCode::class);
    }
}
