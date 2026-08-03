<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (
            DB::getDriverName() !== 'mysql'
            || ! Schema::hasTable('platform_notifications')
            || ! Schema::hasTable('tickets')
        ) {
            return;
        }

        $this->dropTriggers();

        $clientColumn = $this->firstColumn(
            'tickets',
            ['user_id', 'client_id', 'customer_id'],
        );

        if ($clientColumn === null) {
            return;
        }

        $labelExpression = $this->ticketLabelExpression();
        $statusExpression = Schema::hasColumn('tickets', 'status')
            ? "LOWER(COALESCE(NEW.status, ''))"
            : "''";

        DB::unprepared("
            CREATE TRIGGER astreon_ticket_created_notification
            AFTER INSERT ON tickets
            FOR EACH ROW
            BEGIN
                INSERT INTO platform_notifications (
                    user_id,
                    type,
                    title,
                    message,
                    url,
                    icon,
                    severity,
                    subject_type,
                    subject_id,
                    data,
                    read_at,
                    created_at,
                    updated_at
                )
                VALUES (
                    NEW.{$clientColumn},
                    'ticket.opened',
                    'Ticket ouvert',
                    CONCAT('Votre ticket « ', {$labelExpression}, ' » a bien été créé.'),
                    CONCAT('/client/support/', NEW.id),
                    'ticket',
                    'success',
                    'ticket',
                    NEW.id,
                    JSON_OBJECT('ticket_id', NEW.id),
                    NULL,
                    NOW(),
                    NOW()
                );

                INSERT INTO platform_notifications (
                    user_id,
                    type,
                    title,
                    message,
                    url,
                    icon,
                    severity,
                    subject_type,
                    subject_id,
                    data,
                    read_at,
                    created_at,
                    updated_at
                )
                SELECT
                    users.id,
                    'ticket.awaiting_admin',
                    'Nouveau ticket en attente',
                    CONCAT('Un client a ouvert le ticket « ', {$labelExpression}, ' ».'),
                    CONCAT('/admin/tickets/', NEW.id),
                    'ticket',
                    'warning',
                    'ticket',
                    NEW.id,
                    JSON_OBJECT(
                        'ticket_id', NEW.id,
                        'client_id', NEW.{$clientColumn}
                    ),
                    NULL,
                    NOW(),
                    NOW()
                FROM users
                WHERE users.role IN ('support', 'admin', 'super_admin');
            END
        ");

        if (Schema::hasColumn('tickets', 'status')) {
            DB::unprepared("
                CREATE TRIGGER astreon_ticket_closed_notification
                AFTER UPDATE ON tickets
                FOR EACH ROW
                BEGIN
                    IF
                        OLD.status <> NEW.status
                        AND {$statusExpression} IN (
                            'closed',
                            'resolved',
                            'ferme',
                            'fermé'
                        )
                    THEN
                        INSERT INTO platform_notifications (
                            user_id,
                            type,
                            title,
                            message,
                            url,
                            icon,
                            severity,
                            subject_type,
                            subject_id,
                            data,
                            read_at,
                            created_at,
                            updated_at
                        )
                        VALUES (
                            NEW.{$clientColumn},
                            'ticket.closed',
                            'Ticket fermé',
                            CONCAT('Votre ticket « ', {$labelExpression}, ' » a été fermé par l’équipe Astreon.'),
                            CONCAT('/client/support/', NEW.id),
                            'ticket',
                            'info',
                            'ticket',
                            NEW.id,
                            JSON_OBJECT('ticket_id', NEW.id),
                            NULL,
                            NOW(),
                            NOW()
                        );

                        INSERT INTO platform_notifications (
                            user_id,
                            type,
                            title,
                            message,
                            url,
                            icon,
                            severity,
                            subject_type,
                            subject_id,
                            data,
                            read_at,
                            created_at,
                            updated_at
                        )
                        SELECT
                            users.id,
                            'ticket.closed',
                            'Ticket fermé',
                            CONCAT('Le ticket « ', {$labelExpression}, ' » a été fermé.'),
                            CONCAT('/admin/tickets/', NEW.id),
                            'ticket',
                            'info',
                            'ticket',
                            NEW.id,
                            JSON_OBJECT(
                                'ticket_id', NEW.id,
                                'client_id', NEW.{$clientColumn}
                            ),
                            NULL,
                            NOW(),
                            NOW()
                        FROM users
                        WHERE users.role IN (
                            'support',
                            'admin',
                            'super_admin'
                        );
                    END IF;
                END
            ");
        }

        $this->createReplyTrigger($clientColumn);
        $this->backfillOpenTickets($clientColumn);
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            $this->dropTriggers();
        }
    }

    private function createReplyTrigger(string $clientColumn): void
    {
        if (! Schema::hasTable('ticket_replies')) {
            return;
        }

        $ticketColumn = $this->firstColumn(
            'ticket_replies',
            ['ticket_id', 'support_ticket_id'],
        );

        if ($ticketColumn === null) {
            return;
        }

        $authorColumn = $this->firstColumn(
            'ticket_replies',
            ['user_id', 'author_id', 'admin_id'],
        );

        $authorExpression = $authorColumn !== null
            ? "COALESCE((SELECT name FROM users WHERE id = NEW.{$authorColumn} LIMIT 1), 'Équipe Astreon')"
            : "'Équipe Astreon'";

        $authorRoleExpression = $authorColumn !== null
            ? "COALESCE((SELECT role FROM users WHERE id = NEW.{$authorColumn} LIMIT 1), 'client')"
            : "'support'";

        $labelColumn = $this->firstColumn(
            'tickets',
            ['subject', 'title', 'reference'],
        );

        $ticketLabel = $labelColumn !== null
            ? "COALESCE((SELECT {$labelColumn} FROM tickets WHERE id = NEW.{$ticketColumn} LIMIT 1), CONCAT('#', NEW.{$ticketColumn}))"
            : "CONCAT('#', NEW.{$ticketColumn})";

        DB::unprepared("
            CREATE TRIGGER astreon_ticket_reply_notification
            AFTER INSERT ON ticket_replies
            FOR EACH ROW
            BEGIN
                IF {$authorRoleExpression} IN ('support', 'admin', 'super_admin')
                THEN
                    INSERT INTO platform_notifications (
                        user_id,
                        type,
                        title,
                        message,
                        url,
                        icon,
                        severity,
                        subject_type,
                        subject_id,
                        data,
                        read_at,
                        created_at,
                        updated_at
                    )
                    SELECT
                        tickets.{$clientColumn},
                        'ticket.admin_replied',
                        'Nouvelle réponse du support',
                        CONCAT(
                            {$authorExpression},
                            ' a répondu à votre ticket « ',
                            {$ticketLabel},
                            ' ».'
                        ),
                        CONCAT('/client/support/', tickets.id),
                        'message',
                        'info',
                        'ticket_reply',
                        NEW.id,
                        JSON_OBJECT('ticket_id', tickets.id),
                        NULL,
                        NOW(),
                        NOW()
                    FROM tickets
                    WHERE tickets.id = NEW.{$ticketColumn};
                ELSE
                    INSERT INTO platform_notifications (
                        user_id,
                        type,
                        title,
                        message,
                        url,
                        icon,
                        severity,
                        subject_type,
                        subject_id,
                        data,
                        read_at,
                        created_at,
                        updated_at
                    )
                    SELECT
                        users.id,
                        'ticket.client_replied',
                        'Réponse client en attente',
                        CONCAT(
                            {$authorExpression},
                            ' a répondu au ticket « ',
                            {$ticketLabel},
                            ' ».'
                        ),
                        CONCAT('/admin/tickets/', NEW.{$ticketColumn}),
                        'message',
                        'warning',
                        'ticket_reply',
                        NEW.id,
                        JSON_OBJECT(
                            'ticket_id',
                            NEW.{$ticketColumn}
                        ),
                        NULL,
                        NOW(),
                        NOW()
                    FROM users
                    WHERE users.role IN (
                        'support',
                        'admin',
                        'super_admin'
                    );
                END IF;
            END
        ");
    }

    private function backfillOpenTickets(string $clientColumn): void
    {
        $labelColumn = $this->firstColumn(
            'tickets',
            ['subject', 'title', 'reference'],
        );

        $labelSql = $labelColumn !== null
            ? "COALESCE(tickets.{$labelColumn}, CONCAT('#', tickets.id))"
            : "CONCAT('#', tickets.id)";

        $statusWhere = Schema::hasColumn('tickets', 'status')
            ? "AND LOWER(COALESCE(tickets.status, '')) NOT IN ('closed', 'resolved', 'ferme', 'fermé')"
            : '';

        DB::statement("
            INSERT INTO platform_notifications (
                user_id,
                type,
                title,
                message,
                url,
                icon,
                severity,
                subject_type,
                subject_id,
                data,
                read_at,
                created_at,
                updated_at
            )
            SELECT
                users.id,
                'ticket.awaiting_admin',
                'Ticket en attente',
                CONCAT('Le ticket « ', {$labelSql}, ' » attend une réponse.'),
                CONCAT('/admin/tickets/', tickets.id),
                'ticket',
                'warning',
                'ticket',
                tickets.id,
                JSON_OBJECT(
                    'ticket_id',
                    tickets.id,
                    'client_id',
                    tickets.{$clientColumn}
                ),
                NULL,
                NOW(),
                NOW()
            FROM tickets
            CROSS JOIN users
            WHERE users.role IN ('support', 'admin', 'super_admin')
            {$statusWhere}
            AND NOT EXISTS (
                SELECT 1
                FROM platform_notifications existing
                WHERE existing.user_id = users.id
                  AND existing.type = 'ticket.awaiting_admin'
                  AND existing.subject_type = 'ticket'
                  AND existing.subject_id = tickets.id
            )
        ");
    }

    private function ticketLabelExpression(): string
    {
        $column = $this->firstColumn(
            'tickets',
            ['subject', 'title', 'reference'],
        );

        return $column !== null
            ? "COALESCE(NEW.{$column}, CONCAT('#', NEW.id))"
            : "CONCAT('#', NEW.id)";
    }

    private function firstColumn(
        string $table,
        array $columns,
    ): ?string {
        foreach ($columns as $column) {
            if (Schema::hasColumn($table, $column)) {
                return $column;
            }
        }

        return null;
    }

    private function dropTriggers(): void
    {
        foreach ([
            'astreon_ticket_created_notification',
            'astreon_ticket_closed_notification',
            'astreon_ticket_reply_notification',
        ] as $trigger) {
            DB::unprepared("DROP TRIGGER IF EXISTS {$trigger}");
        }
    }
};
