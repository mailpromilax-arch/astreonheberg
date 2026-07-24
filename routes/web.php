<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\CatalogController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\ProductCategoryController as AdminProductCategoryController;
use App\Http\Controllers\Admin\ProductPlanController as AdminProductPlanController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;

Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::get('/checkout', [CheckoutController::class, 'index'])
        ->name('checkout.index');

    Route::post('/checkout', [CheckoutController::class, 'store'])
        ->name('checkout.store');

    Route::get('/checkout/success/{order}', [
        CheckoutController::class,
        'success',
    ])->name('checkout.success');
});

Route::inertia('/', 'welcome')->name('home');

Route::get('/offres', [CatalogController::class, 'index'])
    ->name('catalog.index');

Route::get('/boutique', [StoreController::class, 'index'])
    ->name('store.index');

Route::get('/boutique/{product:slug}', [StoreController::class, 'show'])
    ->name('store.show');

Route::get('/panier', [CartController::class, 'index'])
    ->name('cart.index');

Route::post('/panier/{plan}', [CartController::class, 'store'])
    ->name('cart.store');

Route::patch('/panier/{plan}', [CartController::class, 'update'])
    ->name('cart.update');

Route::delete('/panier/{plan}', [CartController::class, 'destroy'])
    ->name('cart.destroy');

Route::delete('/panier', [CartController::class, 'clear'])
    ->name('cart.clear');

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

Route::middleware('can:manage orders')->group(function (): void {
    Route::get('/orders', [AdminOrderController::class, 'index'])
        ->name('orders.index');

    Route::get('/orders/{order}', [AdminOrderController::class, 'show'])
        ->name('orders.show');

    Route::patch('/orders/{order}', [AdminOrderController::class, 'update'])
        ->name('orders.update');
});

Route::get('/boutique', [StoreController::class, 'index'])
    ->name('store.index');

Route::get('/boutique/{product:slug}', [StoreController::class, 'show'])
    ->name('store.show');

        Route::middleware('can:manage products')->group(function (): void {
            Route::get('/products', [AdminProductController::class, 'index'])
                ->name('products.index');

            Route::resource(
    'plans',
    AdminProductPlanController::class,
)->except('show');
      
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