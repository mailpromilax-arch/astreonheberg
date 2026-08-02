<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('order_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('order_item_id')
                ->unique()
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('product_plan_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('reference', 40)->unique();
            $table->string('name');
            $table->string('status', 30)->default('provisioning');

            $table->string('provider', 40)->nullable();
            $table->string('external_id')->nullable();
            $table->string('external_url')->nullable();

            $table->timestamp('activated_at')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->json('credentials')->nullable();
            $table->json('configuration')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['provider', 'external_id']);
            $table->index(['status', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};