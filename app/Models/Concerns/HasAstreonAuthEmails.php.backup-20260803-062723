<?php
namespace App\Models\Concerns;
use App\Notifications\Auth\AstreonResetPasswordNotification;
use App\Notifications\Auth\AstreonVerifyEmailNotification;
trait HasAstreonAuthEmails {
 public function sendPasswordResetNotification($token): void { $this->notify(new AstreonResetPasswordNotification((string)$token)); }
 public function sendEmailVerificationNotification(): void { $this->notify(new AstreonVerifyEmailNotification()); }
}
