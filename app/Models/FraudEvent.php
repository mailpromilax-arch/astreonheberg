<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class FraudEvent extends Model
{
    protected $fillable = [
        'user_id', 'event', 'severity', 'ip_address', 'route',
        'user_agent', 'context', 'resolved_at',
    ];

    protected function casts(): array
    {
        return ['context' => 'array', 'resolved_at' => 'datetime'];
    }
}
