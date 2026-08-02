<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'reference',
        'status',
        'currency',
        'subtotal_cents',
        'setup_total_cents',
        'tax_total_cents',
        'total_cents',
        'billing_name',
        'billing_email',
        'billing_company',
        'billing_address',
        'billing_postal_code',
        'billing_city',
        'billing_country',
        'terms_accepted',
        'terms_accepted_at',
        'payment_provider',
        'payment_reference',
        'paid_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'subtotal_cents' => 'integer',
            'setup_total_cents' => 'integer',
            'tax_total_cents' => 'integer',
            'total_cents' => 'integer',
            'terms_accepted' => 'boolean',
            'terms_accepted_at' => 'datetime',
            'paid_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function services(): HasMany
{
    return $this->hasMany(Service::class);
}
}