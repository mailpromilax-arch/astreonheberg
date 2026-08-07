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
            'label' => 'Minecraft Java',
            'description' => 'Serveurs Java avec panel complet.',
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
                        'minecraft-bedrock',
                        'ark',
                        'palworld',
                    ],
                    $products,
                ),
                $this->universe(
                    'vps',
                    'VPS',
                    'VPS Cloud performants et administrables.',
                    ['vps-cloud'],
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
                    'minecraft-bedrock',
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
                'FIELD(slug, '.collect($definition['slugs'])
                    ->map(fn (string $slug) => "'".addslashes($slug)."'")
                    ->implode(',').')',
            )
            ->firstOrFail();

        return $this->renderProduct($product, $catalogSlug);
    }

    public function show(Product $product): Response
    {
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

        $lowestPrice = $product?->plans
            ?->pluck('price_monthly_cents')
            ->filter(fn ($price): bool => is_numeric($price))
            ->map(fn ($price): int => (int) $price)
            ->min();

        return [
            'slug' => $catalogSlug,
            'label' => $definition['label'],
            'description' => $definition['description'],
            'href' => "/boutique/{$catalogSlug}",
            'available' => $product !== null && $product->plans->isNotEmpty(),
            'plans_count' => $product?->plans->count() ?? 0,
            'lowest_price_cents' => is_int($lowestPrice)
                ? $lowestPrice
                : null,
        ];
    }

    private function renderProduct(
        Product $product,
        string $catalogSlug,
    ): Response {
        $product->load([
            'category:id,name,slug',
            'plans' => fn ($query) => $query
                ->where('status', 'active')
                ->orderBy('sort_order')
                ->orderBy('price_monthly_cents'),
        ]);

        return Inertia::render('store/show', [
            'product' => $product,
            'catalogSlug' => $catalogSlug,
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
