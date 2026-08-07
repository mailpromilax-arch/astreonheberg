<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table): void {
            if (! Schema::hasColumn('invoices', 'order_id')) {
                $table->foreignId('order_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('orders')
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('invoices', 'user_id')) {
                $table->foreignId('user_id')
                    ->nullable()
                    ->after('order_id')
                    ->constrained('users')
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('invoices', 'number')) {
                $table->string('number')
                    ->nullable()
                    ->unique();
            }

            if (! Schema::hasColumn('invoices', 'status')) {
                $table->string('status')
                    ->default('draft');
            }

            if (! Schema::hasColumn('invoices', 'currency')) {
                $table->string('currency', 3)
                    ->default('EUR');
            }

            if (! Schema::hasColumn('invoices', 'subtotal_cents')) {
                $table->unsignedBigInteger('subtotal_cents')
                    ->default(0);
            }

            if (! Schema::hasColumn('invoices', 'discount_cents')) {
                $table->unsignedBigInteger('discount_cents')
                    ->default(0);
            }

            if (! Schema::hasColumn('invoices', 'tax_total_cents')) {
                $table->unsignedBigInteger('tax_total_cents')
                    ->default(0);
            }

            if (! Schema::hasColumn('invoices', 'total_cents')) {
                $table->unsignedBigInteger('total_cents')
                    ->default(0);
            }

            if (! Schema::hasColumn('invoices', 'issued_at')) {
                $table->timestamp('issued_at')
                    ->nullable();
            }

            if (! Schema::hasColumn('invoices', 'paid_at')) {
                $table->timestamp('paid_at')
                    ->nullable();
            }
        });
    }

    public function down(): void
    {
        /*
         * On ne supprime rien automatiquement afin de ne pas endommager
         * une ancienne structure de facturation déjà utilisée.
         */
    }
};