<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\User;
use App\Services\Mail\AstreonMailer;

final class UserSecurityMailObserver
{
    public function __construct(
        private readonly AstreonMailer $mailer,
    ) {}

    public function updated(User $user): void
    {
        if ($user->wasChanged('email')) {
            $this->mailer->user(
                $user,
                'Votre adresse e-mail Astreon a été modifiée',
                'ALERTE DE SÉCURITÉ',
                'Adresse e-mail modifiée',
                'L’adresse e-mail associée à votre compte vient d’être modifiée.',
                [
                    'Si vous êtes à l’origine de cette modification, aucune action supplémentaire n’est nécessaire.',
                    'Sinon, contactez immédiatement le support Astreon.',
                ],
                'Vérifier mon compte',
                url('/client/account'),
                'Ancienne adresse : '.(string) $user->getOriginal('email'),
                'warning',
            );
        }

        if ($user->wasChanged('two_factor_confirmed_at')) {
            $enabled = ! empty($user->two_factor_confirmed_at);

            $this->mailer->user(
                $user,
                $enabled
                    ? 'Double authentification Astreon activée'
                    : 'Double authentification Astreon désactivée',
                'SÉCURITÉ DU COMPTE',
                $enabled
                    ? 'Double authentification activée'
                    : 'Double authentification désactivée',
                $enabled
                    ? 'Votre compte est désormais protégé par une authentification à deux facteurs.'
                    : 'La double authentification de votre compte vient d’être désactivée.',
                [
                    $enabled
                        ? 'Un code temporaire sera demandé lors de vos prochaines connexions.'
                        : 'Nous vous recommandons de la réactiver dès que possible.',
                ],
                'Gérer la sécurité',
                url('/client/account/security'),
                $enabled
                    ? 'Conservez vos codes de récupération dans un endroit sûr.'
                    : 'Si vous n’êtes pas à l’origine de cette action, changez immédiatement votre mot de passe.',
                $enabled ? 'success' : 'danger',
            );
        }

        if ($user->wasChanged('status')) {
            $this->mailer->user(
                $user,
                'Statut de votre compte Astreon modifié',
                'INFORMATION DU COMPTE',
                'Statut du compte modifié',
                'Le statut de votre compte Astreon vient d’être modifié.',
                ['Contactez le support si vous souhaitez obtenir davantage d’informations.'],
                'Ouvrir mon espace client',
                url('/client'),
                null,
                'warning',
                [
                    'Nouveau statut' => strtoupper((string) $user->status),
                ],
            );
        }
    }
}
