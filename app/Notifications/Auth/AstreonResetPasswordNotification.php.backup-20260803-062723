<?php
namespace App\Notifications\Auth;
use Illuminate\Bus\Queueable; use Illuminate\Notifications\Notification; use Illuminate\Notifications\Messages\MailMessage;
final class AstreonResetPasswordNotification extends Notification {
 use Queueable; public function __construct(private readonly string $token) {}
 public function via(object $notifiable): array { return ['mail']; }
 public function toMail(object $notifiable): MailMessage {
  $email=(string)$notifiable->getEmailForPasswordReset();
  $url=url(route('password.reset',['token'=>$this->token,'email'=>$email],false));
  $minutes=(int)config('auth.passwords.users.expire',60);
  return (new MailMessage())->subject('Réinitialisez votre mot de passe Astreon')->view('emails.astreon',[
   'preheader'=>'Votre lien sécurisé de réinitialisation Astreon.','eyebrow'=>'SÉCURITÉ DU COMPTE','title'=>'Réinitialisation du mot de passe',
   'greeting'=>'Bonjour '.$this->firstName($notifiable).',','intro'=>'Une demande de réinitialisation du mot de passe a été effectuée pour votre compte Astreon.',
   'paragraphs'=>["Le lien ci-dessous est personnel et expirera dans {$minutes} minutes.",'Si vous n’êtes pas à l’origine de cette demande, ignorez simplement cet e-mail.'],
   'actionLabel'=>'Changer mon mot de passe','actionUrl'=>$url,'notice'=>'Ne transmettez jamais ce lien à une autre personne.','footerText'=>'E-mail envoyé à '.$email.'.']);
 }
 private function firstName(object $u): string { $n=trim((string)($u->first_name??$u->name??'Client')); return explode(' ',$n)[0]?:'Client'; }
}
