<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class PromoCode extends Model
{
    protected $fillable = [
        'code',
        'label',
        'type',
        'value',
        'minimum_order_cents',
        'maximum_discount_cents',
        'usage_limit',
        'used_count',
        'one_per_user',
        'is_active',
        'starts_at',
        'ends_at',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'integer',
            'minimum_order_cents' => 'integer',
            'maximum_discount_cents' => 'integer',
            'usage_limit' => 'integer',
            'used_count' => 'integer',
            'one_per_user' => 'boolean',
            'is_active' => 'boolean',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function usages(): HasMany
    {
        return $this->hasMany(PromoCodeUsage::class);
    }
}
