<?php

use App\Http\Controllers\Api\ServerApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/server')->group(function (): void {
    Route::get(
        '/',
        [ServerApiController::class, 'show'],
    )->middleware('service.api:server.read');

    Route::get(
        '/resources',
        [ServerApiController::class, 'resources'],
    )->middleware('service.api:resources.read');

    Route::post(
        '/power',
        [ServerApiController::class, 'power'],
    )->middleware('service.api:power.write');

    Route::post(
        '/command',
        [ServerApiController::class, 'command'],
    )->middleware('service.api:console.write');
});
