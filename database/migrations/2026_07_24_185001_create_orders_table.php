<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('reference', 40)->unique();
            $table->string('status', 30)->default('pending_payment');
            $table->string('currency', 3)->default('EUR');

            $table->unsignedBigInteger('subtotal_cents');
            $table->unsignedBigInteger('setup_total_cents')->default(0);
            $table->unsignedBigInteger('tax_total_cents')->default(0);
            $table->unsignedBigInteger('total_cents');

            $table->string('billing_name');
            $table->string('billing_email');
            $table->string('billing_company')->nullable();
            $table->string('billing_address');
            $table->string('billing_postal_code', 20);
            $table->string('billing_city');
            $table->string('billing_country', 2)->default('FR');

            $table->boolean('terms_accepted')->default(false);
            $table->timestamp('terms_accepted_at')->nullable();

            $table->string('payment_provider', 30)->nullable();
            $table->string('payment_reference')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};