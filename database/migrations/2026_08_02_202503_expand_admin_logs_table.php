<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admin_logs', function (Blueprint $table): void {
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('action')->nullable()->index();
            $table->text('description')->nullable();

            $table->unsignedBigInteger('target_user_id')->nullable()->index();
            $table->unsignedBigInteger('order_id')->nullable()->index();
            $table->unsignedBigInteger('service_id')->nullable()->index();
            $table->unsignedBigInteger('ticket_id')->nullable()->index();

            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('admin_logs', function (Blueprint $table): void {
            $table->dropColumn([
                'user_id',
                'action',
                'description',
                'target_user_id',
                'order_id',
                'service_id',
                'ticket_id',
                'ip_address',
                'user_agent',
                'metadata',
            ]);
        });
    }
};
