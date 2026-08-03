<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use App\Observers\OrderMailObserver;
use App\Observers\ServiceMailObserver;
use App\Observers\UserSecurityMailObserver;
use Illuminate\Support\ServiceProvider;

final class TransactionalMailServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Order::observe(OrderMailObserver::class);
        Service::observe(ServiceMailObserver::class);
        User::observe(UserSecurityMailObserver::class);
    }
}
