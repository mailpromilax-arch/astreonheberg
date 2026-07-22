<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (! Schema::hasColumn('users', 'status')) {
                $table->string('status', 20)
                    ->default('active')
                    ->after('email');
            }

            if (! Schema::hasColumn('users', 'company_name')) {
                $table->string('company_name')
                    ->nullable()
                    ->after('status');
            }

            if (! Schema::hasColumn('users', 'phone')) {
                $table->string('phone', 40)
                    ->nullable()
                    ->after('company_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $columns = [];

            foreach (['status', 'company_name', 'phone'] as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $columns[] = $column;
                }
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};