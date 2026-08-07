<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('promo_codes')) {
            Schema::create('promo_codes', function (Blueprint $table): void {
                $table->id();
                $table->string('code', 80)->unique();
                $table->string('label', 160)->nullable();
                $table->string('type', 20)->default('percent');
                $table->unsignedInteger('value');
                $table->unsignedBigInteger('minimum_order_cents')->default(0);
                $table->unsignedBigInteger('maximum_discount_cents')->nullable();
                $table->unsignedInteger('usage_limit')->nullable();
                $table->unsignedInteger('used_count')->default(0);
                $table->boolean('one_per_user')->default(false);
                $table->boolean('is_active')->default(true);
                $table->timestamp('starts_at')->nullable();
                $table->timestamp('ends_at')->nullable();
                $table->timestamps();
            });
        } else {
            Schema::table('promo_codes', function (Blueprint $table): void {
                if (! Schema::hasColumn('promo_codes', 'code')) {
                    $table->string('code', 80)->nullable()->unique();
                }
                if (! Schema::hasColumn('promo_codes', 'label')) {
                    $table->string('label', 160)->nullable();
                }
                if (! Schema::hasColumn('promo_codes', 'type')) {
                    $table->string('type', 20)->default('percent');
                }
                if (! Schema::hasColumn('promo_codes', 'value')) {
                    $table->unsignedInteger('value')->default(10);
                }
                if (! Schema::hasColumn('promo_codes', 'minimum_order_cents')) {
                    $table->unsignedBigInteger('minimum_order_cents')->default(0);
                }
                if (! Schema::hasColumn('promo_codes', 'maximum_discount_cents')) {
                    $table->unsignedBigInteger('maximum_discount_cents')->nullable();
                }
                if (! Schema::hasColumn('promo_codes', 'usage_limit')) {
                    $table->unsignedInteger('usage_limit')->nullable();
                }
                if (! Schema::hasColumn('promo_codes', 'used_count')) {
                    $table->unsignedInteger('used_count')->default(0);
                }
                if (! Schema::hasColumn('promo_codes', 'one_per_user')) {
                    $table->boolean('one_per_user')->default(false);
                }
                if (! Schema::hasColumn('promo_codes', 'is_active')) {
                    $table->boolean('is_active')->default(true);
                }
                if (! Schema::hasColumn('promo_codes', 'starts_at')) {
                    $table->timestamp('starts_at')->nullable();
                }
                if (! Schema::hasColumn('promo_codes', 'ends_at')) {
                    $table->timestamp('ends_at')->nullable();
                }
            });
        }

        if (! Schema::hasTable('promo_code_usages')) {
            Schema::create('promo_code_usages', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('promo_code_id')
                    ->constrained('promo_codes')
                    ->cascadeOnDelete();
                $table->foreignId('user_id')
                    ->constrained()
                    ->cascadeOnDelete();
                $table->foreignId('order_id')
                    ->constrained()
                    ->cascadeOnDelete();
                $table->unsignedBigInteger('discount_cents');
                $table->timestamps();

                $table->unique('order_id');
                $table->index(['promo_code_id', 'user_id']);
            });
        }

        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table): void {
                if (! Schema::hasColumn('orders', 'discount_cents')) {
                    $table->unsignedBigInteger('discount_cents')
                        ->default(0)
                        ->after('tax_total_cents');
                }

                if (! Schema::hasColumn('orders', 'promo_code_id')) {
                    $table->unsignedBigInteger('promo_code_id')
                        ->nullable()
                        ->after('discount_cents');
                }

                if (! Schema::hasColumn('orders', 'promo_code')) {
                    $table->string('promo_code', 80)
                        ->nullable()
                        ->after('promo_code_id');
                }
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('promo_code_usages');

        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table): void {
                $columns = array_values(array_filter([
                    Schema::hasColumn('orders', 'discount_cents')
                        ? 'discount_cents'
                        : null,
                    Schema::hasColumn('orders', 'promo_code_id')
                        ? 'promo_code_id'
                        : null,
                    Schema::hasColumn('orders', 'promo_code')
                        ? 'promo_code'
                        : null,
                ]));

                if ($columns !== []) {
                    $table->dropColumn($columns);
                }
            });
        }
    }
};
