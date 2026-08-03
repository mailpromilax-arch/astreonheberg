<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('tickets')) {
            Schema::create('tickets', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('user_id')->index();
                $table->unsignedBigInteger('assigned_to')->nullable()->index();
                $table->string('subject');
                $table->enum('priority', ['low', 'medium', 'high'])
                    ->default('medium');
                $table->enum('status', [
                    'open',
                    'assigned',
                    'waiting_admin',
                    'waiting_client',
                    'closed',
                ])->default('open')->index();
                $table->enum('waiting_for', ['admin', 'client'])
                    ->default('admin');
                $table->unsignedBigInteger('last_reply_by')->nullable();
                $table->timestamp('last_replied_at')->nullable();
                $table->timestamp('closed_at')->nullable();
                $table->timestamps();
            });
        } else {
            $this->addTicketColumns();
        }

        if (! Schema::hasTable('ticket_replies')) {
            Schema::create('ticket_replies', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('ticket_id')->index();
                $table->unsignedBigInteger('user_id')->nullable()->index();
                $table->boolean('is_admin')->default(false);
                $table->longText('message');
                $table->timestamps();
            });
        } else {
            $this->addReplyColumns();
        }

        if (! Schema::hasTable('ticket_attachments')) {
            Schema::create('ticket_attachments', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('ticket_id')->index();
                $table->unsignedBigInteger('ticket_reply_id')->nullable()->index();
                $table->unsignedBigInteger('user_id')->nullable()->index();
                $table->string('disk')->default('public');
                $table->string('path');
                $table->string('original_name');
                $table->string('mime_type')->nullable();
                $table->unsignedBigInteger('size')->default(0);
                $table->timestamps();
            });
        } else {
            $this->addAttachmentColumns();
        }
    }

    public function down(): void
    {
        // Migration additive : aucune suppression automatique afin de protéger
        // les tickets et pièces jointes déjà présents en production.
    }

    private function addTicketColumns(): void
    {
        $columns = [
            'user_id' => fn (Blueprint $table) => $table->unsignedBigInteger('user_id')->nullable()->index(),
            'assigned_to' => fn (Blueprint $table) => $table->unsignedBigInteger('assigned_to')->nullable()->index(),
            'subject' => fn (Blueprint $table) => $table->string('subject')->nullable(),
            'priority' => fn (Blueprint $table) => $table->string('priority')->default('medium'),
            'status' => fn (Blueprint $table) => $table->string('status')->default('open')->index(),
            'waiting_for' => fn (Blueprint $table) => $table->string('waiting_for')->default('admin'),
            'last_reply_by' => fn (Blueprint $table) => $table->unsignedBigInteger('last_reply_by')->nullable(),
            'last_replied_at' => fn (Blueprint $table) => $table->timestamp('last_replied_at')->nullable(),
            'closed_at' => fn (Blueprint $table) => $table->timestamp('closed_at')->nullable(),
        ];

        foreach ($columns as $column => $callback) {
            if (! Schema::hasColumn('tickets', $column)) {
                Schema::table('tickets', $callback);
            }
        }
    }

    private function addReplyColumns(): void
    {
        $columns = [
            'ticket_id' => fn (Blueprint $table) => $table->unsignedBigInteger('ticket_id')->nullable()->index(),
            'user_id' => fn (Blueprint $table) => $table->unsignedBigInteger('user_id')->nullable()->index(),
            'is_admin' => fn (Blueprint $table) => $table->boolean('is_admin')->default(false),
            'message' => fn (Blueprint $table) => $table->longText('message')->nullable(),
        ];

        foreach ($columns as $column => $callback) {
            if (! Schema::hasColumn('ticket_replies', $column)) {
                Schema::table('ticket_replies', $callback);
            }
        }
    }

    private function addAttachmentColumns(): void
    {
        $columns = [
            'ticket_id' => fn (Blueprint $table) => $table->unsignedBigInteger('ticket_id')->nullable()->index(),
            'ticket_reply_id' => fn (Blueprint $table) => $table->unsignedBigInteger('ticket_reply_id')->nullable()->index(),
            'user_id' => fn (Blueprint $table) => $table->unsignedBigInteger('user_id')->nullable()->index(),
            'disk' => fn (Blueprint $table) => $table->string('disk')->default('public'),
            'path' => fn (Blueprint $table) => $table->string('path')->nullable(),
            'original_name' => fn (Blueprint $table) => $table->string('original_name')->nullable(),
            'mime_type' => fn (Blueprint $table) => $table->string('mime_type')->nullable(),
            'size' => fn (Blueprint $table) => $table->unsignedBigInteger('size')->default(0),
        ];

        foreach ($columns as $column => $callback) {
            if (! Schema::hasColumn('ticket_attachments', $column)) {
                Schema::table('ticket_attachments', $callback);
            }
        }
    }
};
