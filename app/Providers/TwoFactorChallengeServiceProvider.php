<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Laravel\Fortify\Fortify;

final class TwoFactorChallengeServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Fortify::twoFactorChallengeView(
            fn () => Inertia::render('auth/two-factor-challenge'),
        );
    }
}
