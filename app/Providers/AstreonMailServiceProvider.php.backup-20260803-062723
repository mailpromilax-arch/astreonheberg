<?php
namespace App\Providers;
use App\Notifications\Auth\AstreonWelcomeNotification; use App\Notifications\Auth\AstreonPasswordChangedNotification;
use Illuminate\Auth\Events\Registered; use Illuminate\Auth\Events\PasswordReset; use Illuminate\Support\Facades\Event; use Illuminate\Support\ServiceProvider;
final class AstreonMailServiceProvider extends ServiceProvider {
 public function boot(): void {
  Event::listen(Registered::class,fn(Registered $e)=>$e->user->notify(new AstreonWelcomeNotification()));
  Event::listen(PasswordReset::class,fn(PasswordReset $e)=>$e->user->notify(new AstreonPasswordChangedNotification()));
 }
}
