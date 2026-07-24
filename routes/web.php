<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\CatalogController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\ProductCategoryController as AdminProductCategoryController;

Route::inertia('/', 'welcome')->name('home');

Route::get('/offres', [CatalogController::class, 'index'])
    ->name('catalog.index');

Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::inertia('/dashboard', 'dashboard')
        ->name('dashboard');
});

Route::middleware([
    'auth',
    'verified',
    'can:access admin dashboard',
])
    ->prefix('admin')
    ->name('admin.')
    ->group(function (): void {
        Route::get('/', [AdminDashboardController::class, 'index'])
            ->name('dashboard');

        Route::middleware('can:manage products')->group(function (): void {
            Route::get('/products', [AdminProductController::class, 'index'])
                ->name('products.index');

            Route::delete('/products/{product}', [AdminProductController::class, 'destroy'])
                ->name('products.destroy');

                Route::middleware('can:manage products')->group(function (): void {
    Route::resource(
        'categories',
        AdminProductCategoryController::class,
    )->except('show');

    Route::resource(
    'products',
    AdminProductController::class,
)->except('show');

    Route::get('/products', [AdminProductController::class, 'index'])
        ->name('products.index');

    Route::delete('/products/{product}', [AdminProductController::class, 'destroy'])
        ->name('products.destroy');
});
        });
    });

require __DIR__.'/settings.php';