<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')
                ->unique()
                ->constrained()
                ->cascadeOnDelete();
            $table->bigInteger('balance_cents')->default(0);
            $table->char('currency', 3)->default('EUR');
            $table->timestamps();
        });

        Schema::create('wallet_transactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('wallet_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('actor_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('direction', 10);
            $table->string('type', 50);
            $table->string('source', 50);
            $table->string('status', 30)->default('completed');
            $table->bigInteger('amount_cents');
            $table->bigInteger('balance_before_cents');
            $table->bigInteger('balance_after_cents');
            $table->string('reference', 190)->nullable()->unique();
            $table->string('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['wallet_id', 'created_at']);
        });

        Schema::create('wallet_topups', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('provider', 30);
            $table->string('status', 30)->default('pending');
            $table->bigInteger('amount_cents');
            $table->char('currency', 3)->default('EUR');
            $table->string('provider_reference', 190)
                ->nullable()
                ->unique();
            $table->string('provider_capture_reference', 190)
                ->nullable()
                ->unique();
            $table->text('approval_url')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['provider', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_topups');
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('wallets');
    }
};
