<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_category_id',
        'name',
        'slug',
        'short_description',
        'description',
        'provisioning_driver',
        'status',
        'sort_order',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'product_category_id' => 'integer',
            'sort_order' => 'integer',
            'is_featured' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(
            ProductCategory::class,
            'product_category_id',
        );
    }

    public function plans(): HasMany
    {
        return $this->hasMany(
            ProductPlan::class,
            'product_id',
        );
    }
}