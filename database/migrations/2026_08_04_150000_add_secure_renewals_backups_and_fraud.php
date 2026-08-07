<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('renewal_attempts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('reference')->unique();
            $table->string('provider')->default('stripe');
            $table->string('provider_payment_id')->nullable()->index();
            $table->unsignedBigInteger('amount_cents');
            $table->string('currency', 3)->default('EUR');
            $table->string('status')->default('pending')->index();
            $table->text('failure_message')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            $table->index(['service_id', 'status']);
        });

        Schema::create('fraud_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event');
            $table->string('severity')->default('warning')->index();
            $table->string('ip_address', 45)->nullable();
            $table->string('route')->nullable();
            $table->text('user_agent')->nullable();
            $table->json('context')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->index(['event', 'created_at']);
        });

        Schema::table('services', function (Blueprint $table): void {
            if (! Schema::hasColumn('services', 'backup_enabled')) {
                $table->boolean('backup_enabled')->default(false);
            }
            if (! Schema::hasColumn('services', 'backup_frequency_hours')) {
                $table->unsignedSmallInteger('backup_frequency_hours')->default(24);
            }
            if (! Schema::hasColumn('services', 'next_backup_at')) {
                $table->timestamp('next_backup_at')->nullable()->index();
            }
            if (! Schema::hasColumn('services', 'last_backup_at')) {
                $table->timestamp('last_backup_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fraud_events');
        Schema::dropIfExists('renewal_attempts');
    }
};
