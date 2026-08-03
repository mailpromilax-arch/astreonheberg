<?php

declare(strict_types=1);

namespace App\Observers;

use App\Services\Notifications\NotificationCenter;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

final class TicketReplyObserver
{
    public function __construct(
        private readonly NotificationCenter $notifications,
    ) {}

    public function created(Model $reply): void
    {
        $ticketId = $this->ticketId($reply);

        if ($ticketId === null || ! Schema::hasTable('tickets')) {
            return;
        }

        $ticket = DB::table('tickets')->where('id', $ticketId)->first();

        if ($ticket === null) {
            return;
        }

        $clientId = null;

        foreach (['user_id', 'client_id', 'customer_id'] as $column) {
            if (isset($ticket->{$column}) && is_numeric($ticket->{$column})) {
                $clientId = (int) $ticket->{$column};
                break;
            }
        }

        if ($clientId === null) {
            return;
        }

        $actor = Auth::user();
        $actorName = $actor?->name ?? 'Équipe Astreon';
        $isAdmin = in_array(
            (string) ($actor?->role ?? ''),
            ['support', 'admin', 'super_admin'],
            true,
        );

        $label = trim((string) (
            $ticket->subject
            ?? $ticket->title
            ?? $ticket->reference
            ?? "#{$ticketId}"
        ));

        if ($isAdmin) {
            $this->notifications->client(
                $clientId,
                'ticket.admin_replied',
                'Nouvelle réponse du support',
                "{$actorName} a répondu à votre ticket « {$label} ».",
                "/client/support/{$ticketId}",
                'info',
                'message',
                $actor,
                $reply::class,
                (int) $reply->getKey(),
                ['ticket_id' => $ticketId],
            );

            return;
        }

        $this->notifications->admins(
            'ticket.client_replied',
            'Réponse client en attente',
            "{$actorName} a répondu au ticket « {$label} ».",
            "/admin/tickets/{$ticketId}",
            'warning',
            'message',
            $actor,
            $reply::class,
            (int) $reply->getKey(),
            [
                'client_id' => $clientId,
                'ticket_id' => $ticketId,
            ],
        );
    }

    private function ticketId(Model $reply): ?int
    {
        foreach (['ticket_id', 'support_ticket_id'] as $column) {
            $value = $reply->getAttribute($column);

            if (is_numeric($value)) {
                return (int) $value;
            }
        }

        return null;
    }
}
