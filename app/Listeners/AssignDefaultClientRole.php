<?php

namespace App\Listeners;

use App\Models\User;
use Illuminate\Auth\Events\Registered;

class AssignDefaultClientRole
{
    public function handle(Registered $event): void
    {
        if (! $event->user instanceof User) {
            return;
        }

        if (! $event->user->hasAnyRole(['client', 'support', 'admin'])) {
            $event->user->assignRole('client');
        }

        activity()
            ->causedBy($event->user)
            ->performedOn($event->user)
            ->event('registered')
            ->withProperties([
                'email' => $event->user->email,
                'role' => 'client',
            ])
            ->log('Création du compte client');
    }
}