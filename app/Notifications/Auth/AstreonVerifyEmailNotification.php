<?php
namespace App\Notifications\Auth;
use Illuminate\Auth\Notifications\VerifyEmail; use Illuminate\Bus\Queueable; use Illuminate\Notifications\Messages\MailMessage;
final class AstreonVerifyEmailNotification extends VerifyEmail {
 use Queueable;
 public function toMail($notifiable) {
  $url=$this->verificationUrl($notifiable);
  return (new MailMessage())->subject('Confirmez votre adresse e-mail Astreon')->view('emails.astreon',[
   'preheader'=>'Confirmez votre adresse pour sÃ©curiser votre compte.','eyebrow'=>'BIENVENUE CHEZ ASTREON','title'=>'Confirmez votre adresse e-mail',
   'greeting'=>'Bonjour '.$this->firstName($notifiable).',','intro'=>'Votre compte Astreon a bien Ã©tÃ© crÃ©Ã©. Il reste une derniÃ¨re Ã©tape.',
   'paragraphs'=>['Cliquez sur le bouton ci-dessous afin de confirmer votre adresse e-mail.'],
   'actionLabel'=>'Confirmer mon adresse','actionUrl'=>$url,'notice'=>'Si vous nâ€™avez pas crÃ©Ã© de compte Astreon, ignorez cet e-mail.','footerText'=>'Adresse : '.(string)$notifiable->getEmailForVerification()]);
 }
 private function firstName(object $u): string { $n=trim((string)($u->first_name??$u->name??'Client')); return explode(' ',$n)[0]?:'Client'; }
}
