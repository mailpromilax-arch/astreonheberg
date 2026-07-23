<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function index(): Response
    {
        $categories = ProductCategory::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->with([
                'products' => fn ($query) => $query
                    ->where('status', 'active')
                    ->orderBy('sort_order')
                    ->with([
                        'plans' => fn ($plans) => $plans
                            ->where('status', 'active')
                            ->orderBy('sort_order'),
                    ]),
            ])
            ->get();

        return Inertia::render('catalog', [
            'categories' => $categories,
        ]);
    }
}