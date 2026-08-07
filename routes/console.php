<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('astreon:renew-services')
    ->hourly()
    ->withoutOverlapping(55)
    ->onOneServer();

Schedule::command('astreon:automatic-backups')
    ->hourly()
    ->withoutOverlapping(55)
    ->onOneServer();
