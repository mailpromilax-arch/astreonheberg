<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('promo_code_usages')) {
            return;
        }

        Schema::create('promo_code_usages', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('promo_code_id')
                ->constrained('promo_codes')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('order_id')
                ->nullable()
                ->constrained('orders')
                ->nullOnDelete();

            $table->unsignedInteger('discount_cents')->default(0);

            $table->timestamps();

            $table->index(['promo_code_id', 'user_id']);
            $table->index('order_id');
        });
    }

    public function down(): void
    {
        // La table peut avoir été créée par une autre migration.
        // On ne la supprime donc pas ici.
    }
};
