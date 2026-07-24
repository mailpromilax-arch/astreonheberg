<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
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
                fn ($query) => $query->where(
                    'product_category_id',
                    $categoryId,
                ),
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
            'categories' => $this->categories(),
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

    public function create(): Response
    {
        return Inertia::render('admin/products/form', [
            'product' => null,
            'categories' => $this->categories(),
            'drivers' => $this->drivers(),
            'statuses' => $this->statuses(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateProduct($request);

        $validated['slug'] = $this->makeSlug(
            $validated['slug'] ?? null,
            $validated['name'],
        );

        $product = Product::create($validated);

        activity()
            ->causedBy($request->user())
            ->performedOn($product)
            ->event('product_created')
            ->log("Création du produit {$product->name}");

        return to_route('admin.products.index')
            ->with('success', 'Le produit a été créé.');
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('admin/products/form', [
            'product' => $product->only([
                'id',
                'product_category_id',
                'name',
                'slug',
                'short_description',
                'description',
                'provisioning_driver',
                'status',
                'sort_order',
                'is_featured',
            ]),
            'categories' => $this->categories(),
            'drivers' => $this->drivers(),
            'statuses' => $this->statuses(),
        ]);
    }

    public function update(
        Request $request,
        Product $product,
    ): RedirectResponse {
        $validated = $this->validateProduct($request, $product);

        $validated['slug'] = $this->makeSlug(
            $validated['slug'] ?? null,
            $validated['name'],
        );

        $product->update($validated);

        activity()
            ->causedBy($request->user())
            ->performedOn($product)
            ->event('product_updated')
            ->log("Modification du produit {$product->name}");

        return to_route('admin.products.index')
            ->with('success', 'Le produit a été modifié.');
    }

    public function destroy(
        Request $request,
        Product $product,
    ): RedirectResponse {
        $productName = $product->name;

        $product->delete();

        activity()
            ->causedBy($request->user())
            ->event('product_deleted')
            ->withProperties([
                'product_name' => $productName,
            ])
            ->log("Suppression du produit {$productName}");

        return back()->with('success', 'Le produit a été supprimé.');
    }

    private function validateProduct(
        Request $request,
        ?Product $product = null,
    ): array {
        return $request->validate([
            'product_category_id' => [
                'required',
                'integer',
                'exists:product_categories,id',
            ],
            'name' => [
                'required',
                'string',
                'max:150',
            ],
            'slug' => [
                'nullable',
                'string',
                'max:180',
                Rule::unique('products', 'slug')
                    ->ignore($product?->id),
            ],
            'short_description' => [
                'nullable',
                'string',
                'max:500',
            ],
            'description' => [
                'nullable',
                'string',
                'max:10000',
            ],
            'provisioning_driver' => [
                'required',
                Rule::in(array_keys($this->drivers())),
            ],
            'status' => [
                'required',
                Rule::in(array_keys($this->statuses())),
            ],
            'sort_order' => [
                'required',
                'integer',
                'min:0',
                'max:9999',
            ],
            'is_featured' => [
                'required',
                'boolean',
            ],
        ]);
    }

    private function makeSlug(?string $slug, string $name): string
    {
        return Str::slug(
            filled($slug) ? $slug : $name,
        );
    }

    private function categories()
    {
        return ProductCategory::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);
    }

    private function drivers(): array
    {
        return [
            'manual' => 'Manuel',
            'pterodactyl' => 'Pterodactyl',
            'proxmox' => 'Proxmox',
            'plesk' => 'Plesk',
        ];
    }

    private function statuses(): array
    {
        return [
            'active' => 'Actif',
            'draft' => 'Brouillon',
            'disabled' => 'Désactivé',
        ];
    }
}