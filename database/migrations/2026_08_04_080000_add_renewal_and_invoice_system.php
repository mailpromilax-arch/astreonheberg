<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table): void {
            if (! Schema::hasColumn('services', 'auto_renew')) {
                $table->boolean('auto_renew')->default(false)->after('expires_at');
            }
            if (! Schema::hasColumn('services', 'renewal_price_cents')) {
                $table->unsignedInteger('renewal_price_cents')->nullable()->after('auto_renew');
            }
            if (! Schema::hasColumn('services', 'renewal_failed_at')) {
                $table->timestamp('renewal_failed_at')->nullable()->after('renewal_price_cents');
            }
            if (! Schema::hasColumn('services', 'renewal_reminded_at')) {
                $table->timestamp('renewal_reminded_at')->nullable()->after('renewal_failed_at');
            }
        });

        Schema::table('invoices', function (Blueprint $table): void {
            if (! Schema::hasColumn('invoices', 'user_id')) {
                $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            }
            if (! Schema::hasColumn('invoices', 'order_id')) {
                $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            }
            if (! Schema::hasColumn('invoices', 'number')) {
                $table->string('number')->nullable()->unique();
            }
            if (! Schema::hasColumn('invoices', 'status')) {
                $table->string('status', 30)->default('paid');
            }
            if (! Schema::hasColumn('invoices', 'currency')) {
                $table->string('currency', 3)->default('EUR');
            }
            if (! Schema::hasColumn('invoices', 'subtotal_cents')) {
                $table->unsignedInteger('subtotal_cents')->default(0);
            }
            if (! Schema::hasColumn('invoices', 'discount_cents')) {
                $table->unsignedInteger('discount_cents')->default(0);
            }
            if (! Schema::hasColumn('invoices', 'tax_total_cents')) {
                $table->unsignedInteger('tax_total_cents')->default(0);
            }
            if (! Schema::hasColumn('invoices', 'total_cents')) {
                $table->unsignedInteger('total_cents')->default(0);
            }
            if (! Schema::hasColumn('invoices', 'issued_at')) {
                $table->timestamp('issued_at')->nullable();
            }
            if (! Schema::hasColumn('invoices', 'paid_at')) {
                $table->timestamp('paid_at')->nullable();
            }
            if (! Schema::hasColumn('invoices', 'metadata')) {
                $table->json('metadata')->nullable();
            }
        });

        Schema::table('services', function (Blueprint $table): void {
            $table->index(['auto_renew', 'expires_at'], 'services_auto_renew_expires_idx');
            $table->index(['status', 'expires_at'], 'services_status_expires_idx');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table): void {
            $table->dropIndex('services_auto_renew_expires_idx');
            $table->dropIndex('services_status_expires_idx');
        });
    }
};
