<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('order_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('product_plan_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('product_name');
            $table->string('plan_name');
            $table->string('sku');

            $table->unsignedInteger('quantity')->default(1);
            $table->string('billing_cycle', 20)->default('monthly');

            $table->unsignedBigInteger('unit_price_cents');
            $table->unsignedBigInteger('setup_fee_cents')->default(0);
            $table->unsignedBigInteger('line_subtotal_cents');
            $table->unsignedBigInteger('line_setup_cents')->default(0);
            $table->unsignedBigInteger('line_total_cents');

            $table->json('plan_snapshot')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'product_plan_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};