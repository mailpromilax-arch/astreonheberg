<?php
namespace App\Notifications\Auth;
use Illuminate\Bus\Queueable; use Illuminate\Notifications\Notification; use Illuminate\Notifications\Messages\MailMessage;
final class AstreonWelcomeNotification extends Notification {
 use Queueable; public function via(object $n): array { return ['mail']; }
 public function toMail(object $n): MailMessage { return (new MailMessage())->subject('Bienvenue chez Astreon')->view('emails.astreon',[
  'preheader'=>'Votre espace client Astreon est prêt.','eyebrow'=>'VOTRE COMPTE EST CRÉÉ','title'=>'Bienvenue dans l’univers Astreon','greeting'=>'Bonjour '.$this->firstName($n).',',
  'intro'=>'Votre espace client est maintenant créé. Vous pourrez y suivre vos commandes, gérer vos services et contacter notre support.',
  'paragraphs'=>['Vérifiez votre adresse e-mail et activez la double authentification dès votre première connexion.'],
  'actionLabel'=>'Accéder à mon espace client','actionUrl'=>url('/client'),'notice'=>'Astreon ne vous demandera jamais votre mot de passe ou votre code 2FA par e-mail.','footerText'=>'Merci de faire confiance à Astreon.']); }
 private function firstName(object $u): string { $x=trim((string)($u->first_name??$u->name??'Client')); return explode(' ',$x)[0]?:'Client'; }
}
