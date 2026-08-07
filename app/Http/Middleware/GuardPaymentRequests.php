<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Services\Security\PaymentFraudGuard;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

final class GuardPaymentRequests
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user || ! $request->isMethod('post')) {
            return $next($request);
        }

        if (! $request->is('checkout*', 'orders/*/stripe', 'client/wallet/*')) {
            return $next($request);
        }

        $amount = (int) $request->input('amount_cents', $request->input('amount', 100));
        if ($amount > 0 && $amount < 1000 && $request->filled('amount')) {
            $amount *= 100;
        }

        try {
            app(PaymentFraudGuard::class)->assertAllowed(
                $user,
                $request->route()?->getName() ?? $request->path(),
                max(1, $amount),
            );
        } catch (Throwable $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return $next($request);
    }
}
