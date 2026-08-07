<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Invoice extends Model
{
    protected $fillable = [
        'user_id', 'order_id', 'number', 'status', 'currency',
        'subtotal_cents', 'discount_cents', 'tax_total_cents', 'total_cents',
        'issued_at', 'paid_at', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'subtotal_cents' => 'integer',
            'discount_cents' => 'integer',
            'tax_total_cents' => 'integer',
            'total_cents' => 'integer',
            'issued_at' => 'datetime',
            'paid_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
