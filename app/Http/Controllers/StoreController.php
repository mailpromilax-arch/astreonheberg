<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    public function index(): Response
    {
        $categories = ProductCategory::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->with([
                'products' => fn ($query) => $query
                    ->where('status', 'active')
                    ->orderBy('sort_order')
                    ->orderBy('name')
                    ->with([
                        'plans' => fn ($plans) => $plans
                            ->where('status', 'active')
                            ->orderBy('sort_order')
                            ->orderBy('price_monthly_cents'),
                    ]),
            ])
            ->get();

        return Inertia::render('store/index', [
            'categories' => $categories,
        ]);
    }

    public function show(Product $product): Response
    {
        abort_unless(
            $product->status === 'active'
            && $product->category?->is_active,
            404,
        );

        $product->load([
            'category:id,name,slug',
            'plans' => fn ($query) => $query
                ->where('status', 'active')
                ->orderBy('sort_order')
                ->orderBy('price_monthly_cents'),
        ]);

        return Inertia::render('store/show', [
            'product' => $product,
        ]);
    }
}