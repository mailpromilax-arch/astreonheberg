<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $categoryId = $request->integer('category');
        $status = $request->string('status')->toString();

        $products = Product::query()
            ->with('category:id,name')
            ->withCount('plans')
            ->when(
                $search !== '',
                fn ($query) => $query->where(function ($query) use ($search): void {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('short_description', 'like', "%{$search}%");
                }),
            )
            ->when(
                $categoryId > 0,
                fn ($query) => $query->where('product_category_id', $categoryId),
            )
            ->when(
                in_array($status, ['active', 'draft', 'disabled'], true),
                fn ($query) => $query->where('status', $status),
            )
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'categories' => ProductCategory::query()
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name']),
            'filters' => [
                'search' => $search,
                'category' => $categoryId ?: null,
                'status' => $status,
            ],
            'statistics' => [
                'total' => Product::count(),
                'active' => Product::where('status', 'active')->count(),
                'draft' => Product::where('status', 'draft')->count(),
                'featured' => Product::where('is_featured', true)->count(),
            ],
        ]);
    }

    public function destroy(Product $product): RedirectResponse
    {
        $productName = $product->name;

        $product->delete();

        activity()
            ->causedBy(auth()->user())
            ->event('product_deleted')
            ->withProperties([
                'product_name' => $productName,
            ])
            ->log("Suppression du produit {$productName}");

        return back()->with('success', 'Le produit a été supprimé.');
    }
}