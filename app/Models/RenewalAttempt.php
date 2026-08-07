<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class RenewalAttempt extends Model
{
    protected $fillable = [
        'service_id', 'user_id', 'reference', 'provider',
        'provider_payment_id', 'amount_cents', 'currency',
        'status', 'failure_message', 'metadata', 'processed_at',
    ];

    protected function casts(): array
    {
        return ['metadata' => 'array', 'processed_at' => 'datetime'];
    }

    public function service(): BelongsTo { return $this->belongsTo(Service::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
