<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

final class ShareFlashData
{
    public function handle(Request $request, Closure $next): Response
    {
        Inertia::share([
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'status' => fn () => $request->session()->get('status'),
                'temporary_password' => fn () => $request->session()->get('temporary_password'),
            ],
        ]);

        return $next($request);
    }
}
