<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table): void {
            if (! Schema::hasColumn('locations', 'pterodactyl_id')) {
                $table->unsignedBigInteger('pterodactyl_id')->nullable()->unique();
            }
            if (! Schema::hasColumn('locations', 'short')) {
                $table->string('short')->nullable();
            }
            if (! Schema::hasColumn('locations', 'name')) {
                $table->string('name')->nullable();
            }
            if (! Schema::hasColumn('locations', 'description')) {
                $table->text('description')->nullable();
            }
        });

        Schema::table('nodes', function (Blueprint $table): void {
            if (! Schema::hasColumn('nodes', 'pterodactyl_id')) {
                $table->unsignedBigInteger('pterodactyl_id')->nullable()->unique();
            }
            if (! Schema::hasColumn('nodes', 'location_id')) {
                $table->unsignedBigInteger('location_id')->nullable()->index();
            }
            if (! Schema::hasColumn('nodes', 'name')) {
                $table->string('name')->nullable();
            }
            if (! Schema::hasColumn('nodes', 'fqdn')) {
                $table->string('fqdn')->nullable();
            }
            if (! Schema::hasColumn('nodes', 'scheme')) {
                $table->string('scheme')->nullable();
            }
            if (! Schema::hasColumn('nodes', 'status')) {
                $table->string('status')->default('unknown')->index();
            }
            if (! Schema::hasColumn('nodes', 'memory_total')) {
                $table->unsignedBigInteger('memory_total')->default(0);
            }
            if (! Schema::hasColumn('nodes', 'disk_total')) {
                $table->unsignedBigInteger('disk_total')->default(0);
            }
            if (! Schema::hasColumn('nodes', 'memory_overallocate')) {
                $table->integer('memory_overallocate')->default(0);
            }
            if (! Schema::hasColumn('nodes', 'disk_overallocate')) {
                $table->integer('disk_overallocate')->default(0);
            }
            if (! Schema::hasColumn('nodes', 'servers_count')) {
                $table->unsignedInteger('servers_count')->default(0);
            }
            if (! Schema::hasColumn('nodes', 'last_synced_at')) {
                $table->timestamp('last_synced_at')->nullable();
            }
            if (! Schema::hasColumn('nodes', 'raw')) {
                $table->json('raw')->nullable();
            }
        });

        Schema::table('servers', function (Blueprint $table): void {
            if (! Schema::hasColumn('servers', 'pterodactyl_id')) {
                $table->unsignedBigInteger('pterodactyl_id')->nullable()->unique();
            }
            if (! Schema::hasColumn('servers', 'identifier')) {
                $table->string('identifier')->nullable()->index();
            }
            if (! Schema::hasColumn('servers', 'uuid')) {
                $table->uuid('uuid')->nullable()->index();
            }
            if (! Schema::hasColumn('servers', 'external_id')) {
                $table->string('external_id')->nullable()->index();
            }
            if (! Schema::hasColumn('servers', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->index();
            }
            if (! Schema::hasColumn('servers', 'pterodactyl_user_id')) {
                $table->unsignedBigInteger('pterodactyl_user_id')->nullable()->index();
            }
            if (! Schema::hasColumn('servers', 'node_id')) {
                $table->unsignedBigInteger('node_id')->nullable()->index();
            }
            if (! Schema::hasColumn('servers', 'name')) {
                $table->string('name')->nullable();
            }
            if (! Schema::hasColumn('servers', 'status')) {
                $table->string('status')->default('unknown')->index();
            }
            if (! Schema::hasColumn('servers', 'cpu')) {
                $table->unsignedInteger('cpu')->default(0);
            }
            if (! Schema::hasColumn('servers', 'memory')) {
                $table->unsignedBigInteger('memory')->default(0);
            }
            if (! Schema::hasColumn('servers', 'disk')) {
                $table->unsignedBigInteger('disk')->default(0);
            }
            if (! Schema::hasColumn('servers', 'allocation')) {
                $table->string('allocation')->nullable();
            }
            if (! Schema::hasColumn('servers', 'suspended')) {
                $table->boolean('suspended')->default(false);
            }
            if (! Schema::hasColumn('servers', 'last_synced_at')) {
                $table->timestamp('last_synced_at')->nullable();
            }
            if (! Schema::hasColumn('servers', 'raw')) {
                $table->json('raw')->nullable();
            }
        });
    }

    public function down(): void
    {
        // Migration volontairement additive : aucune suppression automatique.
    }
};
