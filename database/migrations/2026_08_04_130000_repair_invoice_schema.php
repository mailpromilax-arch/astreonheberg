<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('invoices')) {
            Schema::create('invoices', function (Blueprint $table): void {
                $table->id();
                $table->timestamps();
            });
        }

        $this->addColumn('order_id', function (Blueprint $table): void {
            $table->unsignedBigInteger('order_id')->nullable()->after('id');
        });

        $this->addColumn('user_id', function (Blueprint $table): void {
            $table->unsignedBigInteger('user_id')->nullable()->after('order_id');
        });

        $this->addColumn('number', function (Blueprint $table): void {
            $table->string('number', 80)->nullable()->after('user_id');
        });

        $this->addColumn('status', function (Blueprint $table): void {
            $table->string('status', 30)->default('paid')->after('number');
        });

        $this->addColumn('currency', function (Blueprint $table): void {
            $table->string('currency', 3)->default('EUR')->after('status');
        });

        $this->addColumn('subtotal_cents', function (Blueprint $table): void {
            $table->unsignedBigInteger('subtotal_cents')->default(0)->after('currency');
        });

        $this->addColumn('discount_cents', function (Blueprint $table): void {
            $table->unsignedBigInteger('discount_cents')->default(0)->after('subtotal_cents');
        });

        $this->addColumn('tax_total_cents', function (Blueprint $table): void {
            $table->unsignedBigInteger('tax_total_cents')->default(0)->after('discount_cents');
        });

        $this->addColumn('total_cents', function (Blueprint $table): void {
            $table->unsignedBigInteger('total_cents')->default(0)->after('tax_total_cents');
        });

        $this->addColumn('issued_at', function (Blueprint $table): void {
            $table->timestamp('issued_at')->nullable()->after('total_cents');
        });

        $this->addColumn('paid_at', function (Blueprint $table): void {
            $table->timestamp('paid_at')->nullable()->after('issued_at');
        });

        $this->addColumn('metadata', function (Blueprint $table): void {
            $table->json('metadata')->nullable()->after('paid_at');
        });

        $this->addIndexIfMissing('invoices_order_id_index', ['order_id']);
        $this->addIndexIfMissing('invoices_user_id_index', ['user_id']);
        $this->addUniqueIfMissing('invoices_number_unique', ['number']);
    }

    public function down(): void
    {
        // Migration de réparation volontairement non destructive.
    }

    private function addColumn(string $column, callable $definition): void
    {
        if (Schema::hasColumn('invoices', $column)) {
            return;
        }

        Schema::table('invoices', function (Blueprint $table) use ($definition): void {
            $definition($table);
        });
    }

    private function addIndexIfMissing(string $index, array $columns): void
    {
        try {
            Schema::table('invoices', function (Blueprint $table) use ($index, $columns): void {
                $table->index($columns, $index);
            });
        } catch (Throwable) {
            // L'index existe probablement déjà.
        }
    }

    private function addUniqueIfMissing(string $index, array $columns): void
    {
        try {
            Schema::table('invoices', function (Blueprint $table) use ($index, $columns): void {
                $table->unique($columns, $index);
            });
        } catch (Throwable) {
            // L'index existe probablement déjà.
        }
    }
};
