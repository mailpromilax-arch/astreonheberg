<?php

declare(strict_types=1);

namespace App\Providers;

use App\Observers\AdminLogObserver;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;

final class NotificationCenterServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        if (
            class_exists(\App\Models\AdminLog::class)
            && is_subclass_of(\App\Models\AdminLog::class, Model::class)
        ) {
            \App\Models\AdminLog::observe(AdminLogObserver::class);
        }
    }
}
