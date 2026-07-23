<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class ProductCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));

        $categories = ProductCategory::query()
            ->withCount('products')
            ->when(
                $search !== '',
                fn ($query) => $query->where(function ($query) use ($search): void {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                }),
            )
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
            'filters' => [
                'search' => $search,
            ],
            'statistics' => [
                'total' => ProductCategory::count(),
                'active' => ProductCategory::where('is_active', true)->count(),
                'disabled' => ProductCategory::where('is_active', false)->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/categories/form', [
            'category' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:120', 'unique:product_categories,slug'],
            'description' => ['nullable', 'string', 'max:2000'],
            'icon' => ['nullable', 'string', 'max:100'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['required', 'boolean'],
        ]);

        $validated['slug'] = Str::slug(
            $validated['slug'] ?: $validated['name'],
        );

        $category = ProductCategory::create($validated);

        activity()
            ->causedBy($request->user())
            ->performedOn($category)
            ->event('category_created')
            ->log("Création de la catégorie {$category->name}");

        return to_route('admin.categories.index')
            ->with('success', 'La catégorie a été créée.');
    }

    public function edit(ProductCategory $category): Response
    {
        return Inertia::render('admin/categories/form', [
            'category' => $category->only([
                'id',
                'name',
                'slug',
                'description',
                'icon',
                'sort_order',
                'is_active',
            ]),
        ]);
    }

    public function update(
        Request $request,
        ProductCategory $category,
    ): RedirectResponse {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => [
                'nullable',
                'string',
                'max:120',
                Rule::unique('product_categories', 'slug')
                    ->ignore($category->id),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
            'icon' => ['nullable', 'string', 'max:100'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['required', 'boolean'],
        ]);

        $validated['slug'] = Str::slug(
            $validated['slug'] ?: $validated['name'],
        );

        $category->update($validated);

        activity()
            ->causedBy($request->user())
            ->performedOn($category)
            ->event('category_updated')
            ->log("Modification de la catégorie {$category->name}");

        return to_route('admin.categories.index')
            ->with('success', 'La catégorie a été modifiée.');
    }

    public function destroy(
        Request $request,
        ProductCategory $category,
    ): RedirectResponse {
        if ($category->products()->exists()) {
            return back()->with(
                'error',
                'Cette catégorie contient encore des produits.',
            );
        }

        $categoryName = $category->name;
        $category->delete();

        activity()
            ->causedBy($request->user())
            ->event('category_deleted')
            ->withProperties([
                'category_name' => $categoryName,
            ])
            ->log("Suppression de la catégorie {$categoryName}");

        return back()->with('success', 'La catégorie a été supprimée.');
    }
}