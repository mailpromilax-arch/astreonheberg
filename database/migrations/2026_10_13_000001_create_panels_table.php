<?php
declare(strict_types=1);
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void { Schema::create('panels', function (Blueprint $table): void {
  $table->id(); $table->string('name'); $table->string('url'); $table->text('api_key'); $table->text('client_api_key')->nullable();
  $table->boolean('is_active')->default(true); $table->timestamps();
 }); }
 public function down(): void { Schema::dropIfExists('panels'); }
};
