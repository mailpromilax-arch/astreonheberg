<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class AstreonTransactionalNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $subject,
        private readonly string $eyebrow,
        private readonly string $title,
        private readonly string $intro,
        private readonly array $paragraphs = [],
        private readonly ?string $actionLabel = null,
        private readonly ?string $actionUrl = null,
        private readonly ?string $notice = null,
        private readonly string $severity = 'info',
        private readonly array $details = [],
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject($this->subject)
            ->view('emails.astreon', [
                'preheader' => $this->intro,
                'eyebrow' => $this->eyebrow,
                'title' => $this->title,
                'greeting' => 'Bonjour '.$this->firstName($notifiable).',',
                'intro' => $this->intro,
                'paragraphs' => $this->paragraphs,
                'actionLabel' => $this->actionLabel,
                'actionUrl' => $this->actionUrl,
                'notice' => $this->notice,
                'severity' => $this->severity,
                'details' => $this->details,
                'footerText' => 'E-mail automatique envoyé à '
                    .(string) $notifiable->routeNotificationFor('mail').'.',
            ]);
    }

    private function firstName(object $notifiable): string
    {
        $firstName = trim((string) ($notifiable->first_name ?? ''));

        if ($firstName !== '') {
            return $firstName;
        }

        $name = trim((string) ($notifiable->name ?? 'Client'));

        return explode(' ', $name)[0] ?: 'Client';
    }
}
