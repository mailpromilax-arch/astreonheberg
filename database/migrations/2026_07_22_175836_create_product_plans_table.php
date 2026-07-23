<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_plans', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('product_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->string('name');
            $table->string('slug');
            $table->string('sku')->unique();

            $table->unsignedInteger('price_monthly_cents');
            $table->unsignedInteger('setup_fee_cents')->default(0);

            $table->unsignedInteger('ram_mb')->nullable();
            $table->unsignedInteger('disk_gb')->nullable();
            $table->unsignedInteger('cpu_percent')->nullable();
            $table->unsignedInteger('cpu_cores')->nullable();
            $table->unsignedInteger('databases_limit')->nullable();
            $table->unsignedInteger('backups_limit')->nullable();
            $table->unsignedInteger('player_slots')->nullable();

            $table->json('features')->nullable();
            $table->json('provisioning_config')->nullable();

            $table->string('status', 20)->default('active');
            $table->boolean('is_popular')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['product_id', 'slug']);
            $table->index(['status', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_plans');
    }
};
