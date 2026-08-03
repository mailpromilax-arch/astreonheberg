<?php
namespace App\Notifications\Auth;
use Illuminate\Bus\Queueable; use Illuminate\Notifications\Notification; use Illuminate\Notifications\Messages\MailMessage;
final class AstreonPasswordChangedNotification extends Notification {
 use Queueable; public function via(object $n): array { return ['mail']; }
 public function toMail(object $n): MailMessage { return (new MailMessage())->subject('Votre mot de passe Astreon a été modifié')->view('emails.astreon',[
  'preheader'=>'Confirmation de modification de votre mot de passe.','eyebrow'=>'ALERTE DE SÉCURITÉ','title'=>'Mot de passe modifié','greeting'=>'Bonjour '.$this->firstName($n).',',
  'intro'=>'Le mot de passe de votre compte Astreon vient d’être modifié avec succès.','paragraphs'=>['Si vous n’êtes pas à l’origine de cette modification, réinitialisez immédiatement votre mot de passe et contactez le support.'],
  'actionLabel'=>'Vérifier mon compte','actionUrl'=>url('/client/account/security'),'notice'=>'Cette notification ne contient jamais votre mot de passe.','footerText'=>'Modification enregistrée le '.now()->format('d/m/Y à H:i').'.']); }
 private function firstName(object $u): string { $x=trim((string)($u->first_name??$u->name??'Client')); return explode(' ',$x)[0]?:'Client'; }
}
