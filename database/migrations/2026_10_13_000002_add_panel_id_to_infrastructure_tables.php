<?php
declare(strict_types=1);
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void { foreach (['locations','nodes','servers'] as $tableName) {
  if (!Schema::hasTable($tableName) || Schema::hasColumn($tableName,'panel_id')) continue;
  Schema::table($tableName, function(Blueprint $table): void { $table->foreignId('panel_id')->nullable()->after('id')->constrained('panels')->nullOnDelete(); $table->index(['panel_id','pterodactyl_id']); });
 } }
 public function down(): void { foreach (['locations','nodes','servers'] as $tableName) if (Schema::hasTable($tableName) && Schema::hasColumn($tableName,'panel_id')) Schema::table($tableName, fn(Blueprint $t) => $t->dropConstrainedForeignId('panel_id')); }
};
