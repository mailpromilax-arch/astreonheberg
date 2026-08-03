<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Order;
use App\Services\Mail\AstreonMailer;

final class OrderMailObserver
{
    public function __construct(
        private readonly AstreonMailer $mailer,
    ) {}

    public function created(Order $order): void
    {
        $order->loadMissing('user', 'items');

        $amount = number_format(
            ((int) $order->total_cents) / 100,
            2,
            ',',
            ' ',
        ).' '.($order->currency ?: 'EUR');

        $this->mailer->user(
            $order->user,
            "Commande {$order->reference} confirmée",
            'COMMANDE ASTREON',
            'Votre commande est confirmée',
            "Nous avons bien enregistré la commande {$order->reference}.",
            [
                $order->status === 'paid'
                    ? 'Votre paiement a été accepté.'
                    : 'Votre commande est en cours de traitement.',
                'Le déploiement de vos services démarre automatiquement.',
            ],
            'Consulter ma commande',
            url("/client/orders/{$order->id}"),
            'Conservez cette référence pour toute demande au support.',
            'success',
            [
                'Référence' => $order->reference,
                'Montant' => $amount,
                'Statut' => strtoupper((string) $order->status),
            ],
        );
    }

    public function updated(Order $order): void
    {
        if (! $order->wasChanged('status')) {
            return;
        }

        $status = mb_strtolower((string) $order->status);

        $presentation = match ($status) {
            'paid' => [
                'Paiement confirmé',
                'Votre paiement a été accepté et votre commande est validée.',
                'success',
            ],
            'cancelled', 'canceled' => [
                'Commande annulée',
                'Votre commande a été annulée.',
                'warning',
            ],
            'refunded' => [
                'Commande remboursée',
                'Le remboursement de votre commande a été enregistré.',
                'info',
            ],
            'failed' => [
                'Paiement refusé',
                'Le paiement de votre commande n’a pas pu être accepté.',
                'danger',
            ],
            default => null,
        };

        if ($presentation === null) {
            return;
        }

        [$title, $intro, $severity] = $presentation;

        $this->mailer->user(
            $order->user_id,
            "{$title} — {$order->reference}",
            'MISE À JOUR DE COMMANDE',
            $title,
            $intro,
            ['Consultez votre espace client pour connaître les informations à jour.'],
            'Voir la commande',
            url("/client/orders/{$order->id}"),
            null,
            $severity,
            [
                'Référence' => $order->reference,
                'Nouveau statut' => strtoupper($status),
            ],
        );
    }
}
