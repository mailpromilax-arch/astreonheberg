<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'name',
        'slug',
        'sku',
        'price_monthly_cents',
        'setup_fee_cents',
        'ram_mb',
        'disk_gb',
        'cpu_percent',
        'cpu_cores',
        'databases_limit',
        'backups_limit',
        'player_slots',
        'features',
        'specifications',
        'billing_cycles',
        'provisioning_config',
        'stock_quantity',
        'stock_tracking',
        'allow_upgrades',
        'allow_downgrades',
        'status',
        'is_popular',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'features' => 'array',
            'specifications' => 'array',
            'billing_cycles' => 'array',
            'provisioning_config' => 'array',

            'price_monthly_cents' => 'integer',
            'setup_fee_cents' => 'integer',
            'ram_mb' => 'integer',
            'disk_gb' => 'integer',
            'cpu_percent' => 'integer',
            'cpu_cores' => 'integer',
            'databases_limit' => 'integer',
            'backups_limit' => 'integer',
            'player_slots' => 'integer',
            'stock_quantity' => 'integer',
            'sort_order' => 'integer',

            'stock_tracking' => 'boolean',
            'allow_upgrades' => 'boolean',
            'allow_downgrades' => 'boolean',
            'is_popular' => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(
            Product::class,
            'product_id',
        );
    }

    public function getFormattedMonthlyPriceAttribute(): string
    {
        return number_format(
            $this->price_monthly_cents / 100,
            2,
            ',',
            ' ',
        ).' €';
    }

    public function isAvailable(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        if (! $this->stock_tracking) {
            return true;
        }

        return ($this->stock_quantity ?? 0) > 0;
    }
}