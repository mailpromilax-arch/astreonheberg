<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

final class PromoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/promos/index', [
            'promos' => PromoCode::query()
                ->withCount('usages')
                ->latest('id')
                ->get()
                ->map(fn (PromoCode $promo): array => [
                    'id' => $promo->id,
                    'code' => $promo->code,
                    'label' => $promo->label,
                    'type' => $promo->type,
                    'value' => $promo->value,
                    'minimum_order_cents' =>
                        $promo->minimum_order_cents,
                    'maximum_discount_cents' =>
                        $promo->maximum_discount_cents,
                    'usage_limit' => $promo->usage_limit,
                    'used_count' => $promo->used_count,
                    'one_per_user' => $promo->one_per_user,
                    'is_active' => $promo->is_active,
                    'starts_at' => $promo->starts_at?->toIso8601String(),
                    'ends_at' => $promo->ends_at?->toIso8601String(),
                    'created_at' => $promo->created_at?->toIso8601String(),
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        PromoCode::query()->create($data);

        return back()->with(
            'success',
            'Le code promo a été créé.',
        );
    }

    public function update(
        Request $request,
        PromoCode $promo,
    ): RedirectResponse {
        $promo->update($this->validated($request, $promo));

        return back()->with(
            'success',
            'Le code promo a été mis à jour.',
        );
    }

    public function destroy(
        PromoCode $promo,
    ): RedirectResponse {
        $promo->delete();

        return back()->with(
            'success',
            'Le code promo a été supprimé.',
        );
    }

    private function validated(
        Request $request,
        ?PromoCode $promo = null,
    ): array {
        $data = $request->validate([
            'code' => [
                'required',
                'string',
                'max:80',
                'regex:/^[A-Za-z0-9_-]+$/',
                'unique:promo_codes,code'.(
                    $promo ? ','.$promo->id : ''
                ),
            ],
            'label' => [
                'nullable',
                'string',
                'max:160',
            ],
            'type' => [
                'required',
                'in:percent,fixed',
            ],
            'value' => [
                'required',
                'integer',
                'min:1',
                'max:10000000',
            ],
            'minimum_order_cents' => [
                'required',
                'integer',
                'min:0',
            ],
            'maximum_discount_cents' => [
                'nullable',
                'integer',
                'min:1',
            ],
            'usage_limit' => [
                'nullable',
                'integer',
                'min:1',
            ],
            'one_per_user' => [
                'required',
                'boolean',
            ],
            'is_active' => [
                'required',
                'boolean',
            ],
            'starts_at' => [
                'nullable',
                'date',
            ],
            'ends_at' => [
                'nullable',
                'date',
                'after:starts_at',
            ],
        ]);

        $data['code'] = Str::upper(
            trim($data['code']),
        );

        if ($data['type'] === 'percent') {
            $data['value'] = min(
                100,
                (int) $data['value'],
            );
        }

        return $data;
    }
}
