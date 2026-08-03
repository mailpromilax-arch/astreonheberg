<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table): void {
            if (! Schema::hasColumn('settings', 'group')) {
                $table->string('group')->default('general')->index();
            }

            if (! Schema::hasColumn('settings', 'key')) {
                $table->string('key')->index();
            }

            if (! Schema::hasColumn('settings', 'value')) {
                $table->longText('value')->nullable();
            }

            if (! Schema::hasColumn('settings', 'type')) {
                $table->string('type')->default('string');
            }

            if (! Schema::hasColumn('settings', 'is_public')) {
                $table->boolean('is_public')->default(false);
            }
        });
    }

    public function down(): void
    {
        // Migration additive : aucune suppression automatique.
    }
};
