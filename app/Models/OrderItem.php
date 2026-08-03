<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\ProductPlan;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_plan_id',
        'product_name',
        'plan_name',
        'sku',
        'quantity',
        'billing_cycle',
        'unit_price_cents',
        'setup_fee_cents',
        'line_subtotal_cents',
        'line_setup_cents',
        'line_total_cents',
        'plan_snapshot',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price_cents' => 'integer',
            'setup_fee_cents' => 'integer',
            'line_subtotal_cents' => 'integer',
            'line_setup_cents' => 'integer',
            'line_total_cents' => 'integer',
            'plan_snapshot' => 'array',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function service(): HasOne
{
    return $this->hasOne(Service::class);
}

    public function productPlan(): BelongsTo
{
    return $this->belongsTo(
        ProductPlan::class,
        'product_plan_id',
    );
}
}