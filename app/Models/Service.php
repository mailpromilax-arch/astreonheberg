<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    use HasFactory;

    protected $appends = [
        'display_status',
    ];

    protected $fillable = [
        'user_id',
        'order_id',
        'order_item_id',
        'product_plan_id',
        'reference',
        'name',
        'status',
        'provider',
        'external_id',
        'external_url',
        'activated_at',
        'suspended_at',
        'expires_at',
        'cancelled_at',
        'credentials',
        'configuration',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'activated_at' => 'datetime',
            'suspended_at' => 'datetime',
            'expires_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'credentials' => 'encrypted:array',
            'configuration' => 'array',
            'metadata' => 'array',
        ];
    }

    public function getDisplayStatusAttribute(): string
    {
        if ($this->cancelled_at !== null) {
            return 'cancelled';
        }

        if ($this->suspended_at !== null) {
            return 'suspended';
        }

        if (
            $this->expires_at !== null
            && $this->expires_at->isPast()
        ) {
            return 'expired';
        }

        if ($this->status === 'failed') {
            return 'failed';
        }

        if (filled($this->external_id)) {
            return 'active';
        }

        return $this->status ?: 'provisioning';
    }


    public function apiKeys(): HasMany
    {
        return $this->hasMany(ServiceApiKey::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(
            ProductPlan::class,
            'product_plan_id',
        );
    }
}