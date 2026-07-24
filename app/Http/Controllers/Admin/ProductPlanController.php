<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductPlanController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $productId = $request->integer('product');
        $status = $request->string('status')->toString();

        $plans = ProductPlan::query()
            ->with('product:id,name,slug')
            ->when(
                $search !== '',
                fn ($query) => $query->where(function ($query) use ($search): void {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                }),
            )
            ->when(
                $productId > 0,
                fn ($query) => $query->where('product_id', $productId),
            )
            ->when(
                in_array($status, ['active', 'draft', 'disabled'], true),
                fn ($query) => $query->where('status', $status),
            )
            ->orderBy('product_id')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/plans/index', [
            'plans' => $plans,
            'products' => $this->products(),
            'filters' => [
                'search' => $search,
                'product' => $productId ?: null,
                'status' => $status,
            ],
            'statistics' => [
                'total' => ProductPlan::count(),
                'active' => ProductPlan::where('status', 'active')->count(),
                'popular' => ProductPlan::where('is_popular', true)->count(),
                'trackedStock' => ProductPlan::where('stock_tracking', true)->count(),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('admin/plans/form', [
            'plan' => null,
            'products' => $this->products(),
            'selectedProductId' => $request->integer('product') ?: null,
            'statuses' => $this->statuses(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatePlan($request);

        $validated['slug'] = Str::slug(
            filled($validated['slug'] ?? null)
                ? $validated['slug']
                : $validated['name'],
        );

        $validated['price_monthly_cents'] = $this->eurosToCents(
            $validated['price_monthly'],
        );

        $validated['setup_fee_cents'] = $this->eurosToCents(
            $validated['setup_fee'],
        );

        unset(
            $validated['price_monthly'],
            $validated['setup_fee'],
        );

        $validated['features'] = $this->linesToArray(
            $validated['features_text'] ?? '',
        );

        unset($validated['features_text']);

        $validated['specifications'] = [];
        $validated['provisioning_config'] = [];
        $validated['billing_cycles'] = [
            'monthly' => [
                'enabled' => true,
                'discount_percent' => 0,
            ],
        ];

        $plan = ProductPlan::create($validated);

        activity()
            ->causedBy($request->user())
            ->performedOn($plan)
            ->event('plan_created')
            ->log("Création de l’offre {$plan->name}");

        return to_route('admin.plans.index')
            ->with('success', 'L’offre a été créée.');
    }

    public function edit(ProductPlan $plan): Response
    {
        return Inertia::render('admin/plans/form', [
            'plan' => [
                ...$plan->only([
                    'id',
                    'product_id',
                    'name',
                    'slug',
                    'sku',
                    'ram_mb',
                    'disk_gb',
                    'cpu_percent',
                    'cpu_cores',
                    'databases_limit',
                    'backups_limit',
                    'player_slots',
                    'stock_quantity',
                    'stock_tracking',
                    'allow_upgrades',
                    'allow_downgrades',
                    'status',
                    'is_popular',
                    'sort_order',
                ]),
                'price_monthly' => $plan->price_monthly_cents / 100,
                'setup_fee' => $plan->setup_fee_cents / 100,
                'features_text' => implode(
                    PHP_EOL,
                    $plan->features ?? [],
                ),
            ],
            'products' => $this->products(),
            'selectedProductId' => null,
            'statuses' => $this->statuses(),
        ]);
    }

    public function update(
        Request $request,
        ProductPlan $plan,
    ): RedirectResponse {
        $validated = $this->validatePlan($request, $plan);

        $validated['slug'] = Str::slug(
            filled($validated['slug'] ?? null)
                ? $validated['slug']
                : $validated['name'],
        );

        $validated['price_monthly_cents'] = $this->eurosToCents(
            $validated['price_monthly'],
        );

        $validated['setup_fee_cents'] = $this->eurosToCents(
            $validated['setup_fee'],
        );

        unset(
            $validated['price_monthly'],
            $validated['setup_fee'],
        );

        $validated['features'] = $this->linesToArray(
            $validated['features_text'] ?? '',
        );

        unset($validated['features_text']);

        $plan->update($validated);

        activity()
            ->causedBy($request->user())
            ->performedOn($plan)
            ->event('plan_updated')
            ->log("Modification de l’offre {$plan->name}");

        return to_route('admin.plans.index')
            ->with('success', 'L’offre a été modifiée.');
    }

    public function destroy(
        Request $request,
        ProductPlan $plan,
    ): RedirectResponse {
        $name = $plan->name;
        $plan->delete();

        activity()
            ->causedBy($request->user())
            ->event('plan_deleted')
            ->withProperties([
                'plan_name' => $name,
            ])
            ->log("Suppression de l’offre {$name}");

        return back()->with('success', 'L’offre a été supprimée.');
    }

    private function validatePlan(
        Request $request,
        ?ProductPlan $plan = null,
    ): array {
        return $request->validate([
            'product_id' => [
                'required',
                'integer',
                'exists:products,id',
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
            ],
            'sku' => [
                'required',
                'string',
                'max:100',
                Rule::unique('product_plans', 'sku')
                    ->ignore($plan?->id),
            ],
            'price_monthly' => [
                'required',
                'numeric',
                'min:0',
                'max:100000',
            ],
            'setup_fee' => [
                'required',
                'numeric',
                'min:0',
                'max:100000',
            ],
            'ram_mb' => ['nullable', 'integer', 'min:0'],
            'disk_gb' => ['nullable', 'integer', 'min:0'],
            'cpu_percent' => ['nullable', 'integer', 'min:0'],
            'cpu_cores' => ['nullable', 'integer', 'min:0'],
            'databases_limit' => ['nullable', 'integer', 'min:0'],
            'backups_limit' => ['nullable', 'integer', 'min:0'],
            'player_slots' => ['nullable', 'integer', 'min:0'],
            'features_text' => ['nullable', 'string', 'max:10000'],
            'stock_quantity' => ['nullable', 'integer', 'min:0'],
            'stock_tracking' => ['required', 'boolean'],
            'allow_upgrades' => ['required', 'boolean'],
            'allow_downgrades' => ['required', 'boolean'],
            'status' => [
                'required',
                Rule::in(array_keys($this->statuses())),
            ],
            'is_popular' => ['required', 'boolean'],
            'sort_order' => [
                'required',
                'integer',
                'min:0',
                'max:9999',
            ],
        ]);
    }

    private function products()
    {
        return Product::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'slug',
            ]);
    }

    private function statuses(): array
    {
        return [
            'active' => 'Actif',
            'draft' => 'Brouillon',
            'disabled' => 'Désactivé',
        ];
    }

    private function eurosToCents(int|float|string $value): int
    {
        return (int) round(((float) $value) * 100);
    }

    private function linesToArray(string $value): array
    {
        return collect(preg_split('/\R/', $value))
            ->map(fn (string $line): string => trim($line))
            ->filter()
            ->values()
            ->all();
    }
}