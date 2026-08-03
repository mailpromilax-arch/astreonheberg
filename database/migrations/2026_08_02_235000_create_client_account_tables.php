<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            foreach ([
                'first_name',
                'last_name',
                'company_name',
                'address_line_1',
                'address_line_2',
                'city',
                'region',
                'postal_code',
                'country',
                'phone',
                'locale',
            ] as $column) {
                if (! Schema::hasColumn('users', $column)) {
                    $table->string($column)->nullable();
                }
            }

            if (! Schema::hasColumn('users', 'marketing_emails')) {
                $table->boolean('marketing_emails')->default(true);
            }

            if (! Schema::hasColumn('users', 'billing_emails')) {
                $table->boolean('billing_emails')->default(true);
            }

            if (! Schema::hasColumn('users', 'support_emails')) {
                $table->boolean('support_emails')->default(true);
            }
        });

        if (! Schema::hasTable('account_members')) {
            Schema::create('account_members', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('email');
                $table->json('permissions')->nullable();
                $table->string('status')->default('pending')->index();
                $table->string('token', 64)->nullable()->unique();
                $table->timestamp('accepted_at')->nullable();
                $table->timestamp('last_login_at')->nullable();
                $table->timestamps();
                $table->unique(['owner_id', 'email']);
            });
        }

        if (! Schema::hasTable('account_contacts')) {
            Schema::create('account_contacts', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('first_name');
                $table->string('last_name');
                $table->string('company_name')->nullable();
                $table->string('email');
                $table->string('phone')->nullable();
                $table->string('address_line_1')->nullable();
                $table->string('address_line_2')->nullable();
                $table->string('city')->nullable();
                $table->string('region')->nullable();
                $table->string('postal_code')->nullable();
                $table->string('country')->nullable();
                $table->boolean('general_emails')->default(false);
                $table->boolean('billing_emails')->default(false);
                $table->boolean('support_emails')->default(false);
                $table->boolean('is_default_billing')->default(false);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('sent_emails')) {
            Schema::create('sent_emails', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
                $table->string('recipient');
                $table->string('subject');
                $table->longText('html_body')->nullable();
                $table->longText('text_body')->nullable();
                $table->string('type')->nullable()->index();
                $table->string('status')->default('sent')->index();
                $table->string('message_id')->nullable()->index();
                $table->timestamp('sent_at')->nullable()->index();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sent_emails');
        Schema::dropIfExists('account_contacts');
        Schema::dropIfExists('account_members');
    }
};
