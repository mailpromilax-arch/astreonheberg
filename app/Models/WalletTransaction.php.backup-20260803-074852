<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class WalletTransaction extends Model
{
    protected $fillable = [
        'wallet_id',
        'user_id',
        'actor_id',
        'direction',
        'type',
        'source',
        'status',
        'amount_cents',
        'balance_before_cents',
        'balance_after_cents',
        'reference',
        'description',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'amount_cents' => 'integer',
            'balance_before_cents' => 'integer',
            'balance_after_cents' => 'integer',
            'metadata' => 'array',
        ];
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
