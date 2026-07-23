<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductPlan;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/dashboard', [
            'statistics' => [
                'customers' => User::role('client')->count(),
                'administrators' => User::role('admin')->count(),
                'categories' => ProductCategory::count(),
                'products' => Product::count(),
                'plans' => ProductPlan::count(),
            ],

            'latestUsers' => User::query()
                ->latest()
                ->limit(5)
                ->get([
                    'id',
                    'name',
                    'email',
                    'status',
                    'created_at',
                ]),

            'latestActivities' => Activity::query()
                ->with('causer:id,name,email')
                ->latest()
                ->limit(8)
                ->get()
                ->map(fn (Activity $activity): array => [
                    'id' => $activity->id,
                    'description' => $activity->description,
                    'event' => $activity->event,
                    'causer_name' => $activity->causer?->name,
                    'created_at' => $activity->created_at?->toISOString(),
                ]),
        ]);
    }
}