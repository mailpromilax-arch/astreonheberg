<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_plans', function (Blueprint $table): void {
            $table->json('specifications')
                ->nullable()
                ->after('features');

            $table->json('billing_cycles')
                ->nullable()
                ->after('specifications');

            $table->unsignedInteger('stock_quantity')
                ->nullable()
                ->after('billing_cycles');

            $table->boolean('stock_tracking')
                ->default(false)
                ->after('stock_quantity');

            $table->boolean('allow_upgrades')
                ->default(true)
                ->after('stock_tracking');

            $table->boolean('allow_downgrades')
                ->default(true)
                ->after('allow_upgrades');
        });
    }

    public function down(): void
    {
        Schema::table('product_plans', function (Blueprint $table): void {
            $table->dropColumn([
                'specifications',
                'billing_cycles',
                'stock_quantity',
                'stock_tracking',
                'allow_upgrades',
                'allow_downgrades',
            ]);
        });
    }
};