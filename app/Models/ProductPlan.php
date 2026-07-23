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
        'provisioning_config',
        'status',
        'is_popular',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'features' => 'array',
            'provisioning_config' => 'array',
            'is_popular' => 'boolean',
            'price_monthly_cents' => 'integer',
            'setup_fee_cents' => 'integer',
            'ram_mb' => 'integer',
            'disk_gb' => 'integer',
            'cpu_percent' => 'integer',
            'cpu_cores' => 'integer',
            'databases_limit' => 'integer',
            'backups_limit' => 'integer',
            'player_slots' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
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
}
