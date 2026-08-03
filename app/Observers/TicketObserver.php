<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\User;
use App\Services\Notifications\NotificationCenter;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

final class TicketObserver
{
    public function __construct(
        private readonly NotificationCenter $notifications,
    ) {}

    public function created(Model $ticket): void
    {
        $ticketId = (int) $ticket->getKey();
        $clientId = $this->clientId($ticket);

        if ($clientId === null) {
            return;
        }

        $label = $this->label($ticket);
        $actor = Auth::user();

        $this->notifications->client(
            $clientId,
            'ticket.opened',
            'Ticket ouvert',
            "Votre ticket « {$label} » a bien été créé.",
            "/client/support/{$ticketId}",
            'success',
            'ticket',
            $actor,
            $ticket::class,
            $ticketId,
        );

        $this->notifications->admins(
            'ticket.awaiting_admin',
            'Nouveau ticket en attente',
            "Le client a ouvert le ticket « {$label} ».",
            "/admin/tickets/{$ticketId}",
            'warning',
            'ticket',
            $actor,
            $ticket::class,
            $ticketId,
            ['client_id' => $clientId],
        );
    }

    public function updated(Model $ticket): void
    {
        if (! $ticket->wasChanged('status')) {
            return;
        }

        $ticketId = (int) $ticket->getKey();
        $clientId = $this->clientId($ticket);

        if ($clientId === null) {
            return;
        }

        $status = mb_strtolower((string) $ticket->getAttribute('status'));

        if (! in_array($status, ['closed', 'resolved', 'ferme', 'fermé'], true)) {
            return;
        }

        $actor = Auth::user();
        $actorName = $actor?->name ?? 'Système';
        $label = $this->label($ticket);

        $this->notifications->client(
            $clientId,
            'ticket.closed',
            'Ticket fermé',
            "Votre ticket « {$label} » a été fermé par {$actorName}.",
            "/client/support/{$ticketId}",
            'info',
            'ticket',
            $actor,
            $ticket::class,
            $ticketId,
            ['closed_by' => $actorName],
        );

        $this->notifications->admins(
            'ticket.closed',
            'Ticket fermé',
            "Le ticket « {$label} » a été fermé par {$actorName}.",
            "/admin/tickets/{$ticketId}",
            'info',
            'ticket',
            $actor,
            $ticket::class,
            $ticketId,
            [
                'client_id' => $clientId,
                'closed_by' => $actorName,
            ],
            $actor?->id,
        );
    }

    private function clientId(Model $ticket): ?int
    {
        foreach (['user_id', 'client_id', 'customer_id'] as $column) {
            $value = $ticket->getAttribute($column);

            if (is_numeric($value)) {
                return (int) $value;
            }
        }

        return null;
    }

    private function label(Model $ticket): string
    {
        foreach (['subject', 'title', 'reference'] as $column) {
            $value = trim((string) $ticket->getAttribute($column));

            if ($value !== '') {
                return $value;
            }
        }

        return '#'.$ticket->getKey();
    }
}
