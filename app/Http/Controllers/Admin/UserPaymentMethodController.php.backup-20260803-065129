<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Notifications\NotificationCenter;
use App\Services\Mail\AstreonMailer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Throwable;

final class UserPaymentMethodController extends Controller
{
    public function destroy(
        Request $request,
        User $user,
        string $paymentMethod,
    ): RedirectResponse {
        abort_unless($user->hasStripeId(), 404);

        $method = $user->findPaymentMethod($paymentMethod);
        abort_if($method === null, 404);

        try {
            $wasDefault = $user->defaultPaymentMethod()?->id === $method->id;

            $method->delete();

            if ($wasDefault) {
                $remaining = $user->paymentMethods('card')->first();

                if ($remaining !== null) {
                    $user->updateDefaultPaymentMethod($remaining->id);
                    $user->updateDefaultPaymentMethodFromStripe();
                }
            }
        } catch (Throwable $exception) {
            report($exception);

            return back()->with(
                'error',
                'Suppression impossible. Cette carte peut être utilisée par un abonnement actif.',
            );
        }

        app(AstreonMailer::class)->user(
            $user,
            'Moyen de paiement supprimé par un administrateur',
            'FACTURATION & SÉCURITÉ',
            'Un moyen de paiement a été supprimé',
            'Un administrateur a supprimé une carte enregistrée sur votre compte.',
            ['Consultez la page de facturation pour vérifier les moyens de paiement restants.'],
            'Gérer mes moyens de paiement',
            url('/client/account/payment-methods'),
            'Si vous ne reconnaissez pas cette action, contactez immédiatement le support.',
            'warning',
        );

        app(NotificationCenter::class)->majorAccountChange(
            $user,
            'billing.payment_method_deleted',
            'Moyen de paiement supprimé',
            'Un administrateur a supprimé un moyen de paiement de votre compte.',
            $request->user(),
            'warning',
            '/client/account/payment-methods',
            ['payment_method_id' => $paymentMethod],
        );

        return back()->with(
            'success',
            'Le moyen de paiement du client a été supprimé.',
        );
    }
}
