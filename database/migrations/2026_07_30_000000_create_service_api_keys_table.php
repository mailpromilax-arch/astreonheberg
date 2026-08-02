<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_api_keys', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('service_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('token_prefix', 24)->index();
            $table->string('token_hash', 64)->unique();
            $table->json('permissions');
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->index([
                'service_id',
                'revoked_at',
                'expires_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_api_keys');
    }
};
