<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
         * Chaque colonne est ajoutée dans une opération distincte.
         * Cela évite les migrations partiellement appliquées sur les
         * installations Astreon qui possédaient déjà la table services.
         */
        if (! Schema::hasColumn('services', 'backup_enabled')) {
            Schema::table('services', function (Blueprint $table): void {
                $table->boolean('backup_enabled')
                    ->default(false)
                    ->after('auto_renew');
            });
        }

        if (! Schema::hasColumn('services', 'backup_frequency_hours')) {
            Schema::table('services', function (Blueprint $table): void {
                $table->unsignedSmallInteger('backup_frequency_hours')
                    ->default(24)
                    ->after('backup_enabled');
            });
        }

        if (! Schema::hasColumn('services', 'next_backup_at')) {
            Schema::table('services', function (Blueprint $table): void {
                $table->timestamp('next_backup_at')
                    ->nullable()
                    ->after('backup_frequency_hours');
            });

            Schema::table('services', function (Blueprint $table): void {
                $table->index(
                    'next_backup_at',
                    'services_next_backup_at_index',
                );
            });
        }

        if (! Schema::hasColumn('services', 'last_backup_at')) {
            Schema::table('services', function (Blueprint $table): void {
                $table->timestamp('last_backup_at')
                    ->nullable()
                    ->after('next_backup_at');
            });
        }
    }

    public function down(): void
    {
        /*
         * Aucun retrait automatique : les réglages de sauvegarde existants
         * doivent rester intacts en cas de retour arrière.
         */
    }
};
