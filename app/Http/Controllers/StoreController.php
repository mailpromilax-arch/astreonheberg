<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    /**
     * @var array<string, array<string, mixed>>
     */
    private const CATALOG = [
        'fivem' => [
            'label' => 'FiveM',
            'description' => 'Serveurs RP performants et automatisés.',
            'slugs' => ['fivem', 'serveur-fivem', 'hebergement-fivem'],
            'names' => ['FiveM'],
        ],
        'minecraft-java' => [
            'label' => 'Minecraft',
            'description' => 'Serveurs Java et Bedrock avec panel complet.',
            'slugs' => ['minecraft-java', 'minecraft'],
            'names' => ['Minecraft Java'],
        ],
        'minecraft-bedrock' => [
            'label' => 'Minecraft Bedrock',
            'description' => 'Serveurs Bedrock fluides et automatisés.',
            'slugs' => ['minecraft-bedrock', 'bedrock'],
            'names' => ['Minecraft Bedrock'],
        ],
        'ark' => [
            'label' => 'ARK',
            'description' => 'Survival Evolved ou Survival Ascended.',
            'slugs' => ['ark', 'ark-survival'],
            'names' => ['ARK', 'ARK Survival'],
        ],
        'palworld' => [
            'label' => 'Palworld',
            'description' => 'Instances rapides et prêtes à jouer.',
            'slugs' => ['palworld'],
            'names' => ['Palworld'],
        ],
        'vps-cloud' => [
            'label' => 'VPS Cloud',
            'description' => 'Machines virtuelles flexibles avec ressources dédiées.',
            'slugs' => ['vps-cloud', 'vps', 'vps-nvme', 'cloud-vps'],
            'names' => ['VPS Cloud', 'VPS NVMe', 'VPS'],
        ],
        'hebergement-web' => [
            'label' => 'Hébergement Web',
            'description' => 'Hébergement pour sites, boutiques et applications.',
            'slugs' => ['hebergement-web', 'web', 'web-hosting', 'hosting-web'],
            'names' => ['Hébergement Web', 'Web Hosting'],
        ],
    ];

    public function index(): Response
    {
        $products = $this->activeProducts();

        return Inertia::render('store/index', [
            'universes' => [
                $this->universe(
                    'gaming',
                    'Game',
                    'FiveM, Minecraft, ARK et Palworld.',
                    [
                        'fivem',
                        'minecraft-java',
                        'ark',
                        'palworld',
                    ],
                    $products,
                ),
                $this->universe(
                    'web',
                    'Web',
                    'Hébergement Web simple et rapide.',
                    ['hebergement-web'],
                    $products,
                ),
            ],
        ]);
    }

    public function category(string $universe): Response
    {
        $definitions = [
            'gaming' => [
                'title' => 'Serveurs Game',
                'description' => 'Choisissez votre jeu pour afficher uniquement les offres correspondantes.',
                'entries' => [
                    'fivem',
                    'minecraft-java',
                    'ark',
                    'palworld',
                ],
            ],
            'vps' => [
                'title' => 'VPS',
                'description' => 'Choisissez votre gamme VPS.',
                'entries' => ['vps-cloud'],
            ],
            'web' => [
                'title' => 'Hébergement Web',
                'description' => 'Découvrez uniquement nos offres d’hébergement Web.',
                'entries' => ['hebergement-web'],
            ],
        ];

        abort_unless(isset($definitions[$universe]), 404);

        $definition = $definitions[$universe];
        $products = $this->activeProducts();

        $entries = collect($definition['entries'])
            ->map(fn (string $slug): array => $this->entry($slug, $products))
            ->values();

        return Inertia::render('store/category', [
            'universe' => $universe,
            'title' => $definition['title'],
            'description' => $definition['description'],
            'entries' => $entries,
        ]);
    }

    public function landing(string $catalogSlug): Response
    {
        abort_unless(array_key_exists($catalogSlug, self::CATALOG), 404);

        $definition = self::CATALOG[$catalogSlug];

        $product = Product::query()
            ->where('status', 'active')
            ->whereHas(
                'category',
                fn (Builder $query) => $query->where('is_active', true),
            )
            ->where(function (Builder $query) use ($definition): void {
                $query->whereIn('slug', $definition['slugs']);

                foreach ($definition['names'] as $name) {
                    $query->orWhere('name', 'like', "%{$name}%");
                }
            })
            ->orderByRaw(
                'CASE slug '.collect($definition['slugs'])
                    ->map(fn (string $slug, int $index) => 'WHEN ? THEN '.$index)
                    ->implode(' ').' ELSE 999 END',
                $definition['slugs'],
            )
            ->firstOrFail();

        $allPlans = null;

        if ($catalogSlug === 'minecraft-java') {
            $product->load([
                'category:id,name,slug',
                'plans' => fn ($query) => $query
                    ->where('status', 'active')
                    ->orderBy('sort_order')
                    ->orderBy('price_monthly_cents'),
            ]);

            $javaPlans = $product->plans->map(fn ($plan) => array_merge(
                $plan->toArray(),
                ['edition' => 'java'],
            ));

            $bedrock = Product::query()
                ->where('slug', 'minecraft-bedrock')
                ->where('status', 'active')
                ->with([
                    'plans' => fn ($query) => $query
                        ->where('status', 'active')
                        ->orderBy('sort_order')
                        ->orderBy('price_monthly_cents'),
                ])
                ->first();

            $bedrockPlans = $bedrock
                ? $bedrock->plans->map(fn ($plan) => array_merge(
                    $plan->toArray(),
                    ['edition' => 'bedrock'],
                ))
                : collect();

            $allPlans = $javaPlans->concat($bedrockPlans)->values();
        }

        return $this->renderProduct($product, $catalogSlug, $allPlans);
    }

    public function show(Product $product): Response
    {
        abort_if($product->slug === 'hebergement-web', 404);

        abort_unless(
            $product->status === 'active'
            && $product->category?->is_active,
            404,
        );

        return $this->renderProduct($product, $product->slug);
    }

    private function activeProducts(): Collection
    {
        return Product::query()
            ->where('status', 'active')
            ->whereHas(
                'category',
                fn (Builder $query) => $query->where('is_active', true),
            )
            ->with([
                'category:id,name,slug',
                'plans' => fn ($query) => $query
                    ->where('status', 'active')
                    ->orderBy('sort_order')
                    ->orderBy('price_monthly_cents'),
            ])
            ->get();
    }

    private function universe(
        string $slug,
        string $title,
        string $description,
        array $entries,
        Collection $products,
    ): array {
        $items = collect($entries)
            ->map(fn (string $entry): array => $this->entry($entry, $products));

        $prices = $items
            ->pluck('lowest_price_cents')
            ->filter(fn ($price): bool => is_int($price));

        return [
            'slug' => $slug,
            'title' => $title,
            'description' => $description,
            'items' => $items->pluck('label')->all(),
            'available_count' => $items
                ->filter(fn (array $item): bool => $item['available'])
                ->count(),
            'lowest_price_cents' => $prices->isEmpty()
                ? null
                : $prices->min(),
        ];
    }

    private function entry(
        string $catalogSlug,
        Collection $products,
    ): array {
        $definition = self::CATALOG[$catalogSlug];

        $product = $products->first(function (Product $product) use ($definition): bool {
            if (in_array($product->slug, $definition['slugs'], true)) {
                return true;
            }

            foreach ($definition['names'] as $name) {
                if (str_contains(
                    mb_strtolower($product->name),
                    mb_strtolower($name),
                )) {
                    return true;
                }
            }

            return false;
        });

        $plans = collect($product?->plans ?? [])
            ->map(fn ($plan) => array_merge(
                is_array($plan) ? $plan : $plan->toArray(),
                ['edition' => 'java'],
            ));

        if ($catalogSlug === 'minecraft-java') {
            $bedrockProduct = $products->first(
                fn (Product $p): bool => $p->slug === 'minecraft-bedrock',
            );

            if ($bedrockProduct) {
                $bedrockPlans = $bedrockProduct->plans->map(fn ($plan) => array_merge(
                    $plan->toArray(),
                    ['edition' => 'bedrock'],
                ));

                $plans = $plans->concat($bedrockPlans);
            }
        }

        $lowestPrice = $plans
            ->pluck('price_monthly_cents')
            ->filter(fn ($price): bool => is_numeric($price))
            ->map(fn ($price): int => (int) $price)
            ->min();

        return [
            'slug' => $catalogSlug,
            'label' => $definition['label'],
            'description' => $definition['description'],
            'href' => $catalogSlug === 'minecraft-java'
                ? '/minecraft'
                : "/boutique/{$catalogSlug}",
            'available' => $plans->isNotEmpty(),
            'plans_count' => $plans->count(),
            'lowest_price_cents' => is_int($lowestPrice)
                ? $lowestPrice
                : null,
        ];
    }

    /**
     * @param  Collection|null  $allPlans  Plans fusionnés (ex. Java + Bedrock), chacun avec son champ `edition`.
     */
    private function renderProduct(
        Product $product,
        string $catalogSlug,
        ?Collection $allPlans = null,
    ): Response {
        if (! $product->relationLoaded('plans')) {
            $product->load([
                'category:id,name,slug',
                'plans' => fn ($query) => $query
                    ->where('status', 'active')
                    ->orderBy('sort_order')
                    ->orderBy('price_monthly_cents'),
            ]);
        }

        return Inertia::render('store/show', [
            'product' => $product,
            'catalogSlug' => $catalogSlug,
            'allPlans' => $allPlans ?? $product->plans,
            'arkEditions' => $catalogSlug === 'ark'
                ? [
                    [
                        'value' => 'survival-evolved',
                        'label' => 'ARK: Survival Evolved',
                        'description' => 'Version classique, mods Workshop et Egg Pterodactyl 23.',
                    ],
                    [
                        'value' => 'survival-ascended',
                        'label' => 'ARK: Survival Ascended',
                        'description' => 'Nouvelle génération Unreal Engine 5 et Egg Pterodactyl 22.',
                    ],
                ]
                : [],
        ]);
    }
}