<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Service;
use App\Services\Mail\AstreonMailer;

final class ServiceMailObserver
{
    public function __construct(
        private readonly AstreonMailer $mailer,
    ) {}

    public function created(Service $service): void
    {
        $this->mailer->user(
            $service->user_id,
            "Déploiement de {$service->name}",
            'NOUVEAU SERVICE',
            'Votre service est en cours de création',
            "Le déploiement de « {$service->name} » a démarré.",
            [
                'Vous recevrez un nouvel e-mail dès que le service sera prêt.',
                'La durée dépend du produit et du fournisseur sélectionné.',
            ],
            'Suivre le déploiement',
            url("/client/services/{$service->id}"),
            null,
            'info',
            [
                'Service' => $service->name,
                'Référence' => $service->reference,
                'Statut' => strtoupper((string) $service->status),
            ],
        );
    }

    public function updated(Service $service): void
    {
        if (! $service->wasChanged([
            'status',
            'external_id',
            'suspended_at',
            'cancelled_at',
            'expires_at',
        ])) {
            return;
        }

        $status = $service->display_status;

        $presentation = match ($status) {
            'active' => [
                'Votre service est prêt',
                "Le service « {$service->name} » est maintenant disponible.",
                'success',
            ],
            'suspended' => [
                'Service suspendu',
                "Le service « {$service->name} » a été suspendu.",
                'warning',
            ],
            'expired' => [
                'Service expiré',
                "Le service « {$service->name} » est arrivé à expiration.",
                'danger',
            ],
            'cancelled' => [
                'Service annulé',
                "Le service « {$service->name} » a été annulé.",
                'warning',
            ],
            'failed' => [
                'Échec du déploiement',
                "Le déploiement de « {$service->name} » a rencontré un problème.",
                'danger',
            ],
            default => null,
        };

        if ($presentation === null) {
            return;
        }

        [$title, $intro, $severity] = $presentation;

        $this->mailer->user(
            $service->user_id,
            "{$title} — {$service->name}",
            'MISE À JOUR DU SERVICE',
            $title,
            $intro,
            [
                $status === 'active'
                    ? 'Vous pouvez maintenant administrer votre service depuis le panel Astreon.'
                    : 'Consultez votre espace client ou ouvrez un ticket si vous avez besoin d’aide.',
            ],
            'Gérer mon service',
            url("/client/services/{$service->id}"),
            null,
            $severity,
            [
                'Service' => $service->name,
                'Référence' => $service->reference,
                'Statut' => strtoupper($status),
            ],
        );
    }
}
