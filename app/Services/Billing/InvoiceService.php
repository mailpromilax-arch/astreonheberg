<?php

declare(strict_types=1);

namespace App\Services\Billing;

use App\Models\Invoice;
use App\Models\Order;
use App\Services\Mail\AstreonMailer;
use Illuminate\Support\Facades\DB;

final class InvoiceService
{
    public function __construct(private readonly AstreonMailer $mailer) {}

    public function forPaidOrder(Order $order, bool $sendMail = true): Invoice
    {
        $order->loadMissing(['user', 'items']);

        $invoice = DB::transaction(function () use ($order): Invoice {
            $invoice = Invoice::query()->firstOrCreate(
                ['order_id' => $order->id],
                [
                    'user_id' => $order->user_id,
                    'status' => 'paid',
                    'currency' => $order->currency ?: 'EUR',
                    'subtotal_cents' => (int) $order->subtotal_cents + (int) $order->setup_total_cents,
                    'discount_cents' => (int) ($order->discount_cents ?? 0),
                    'tax_total_cents' => (int) $order->tax_total_cents,
                    'total_cents' => (int) $order->total_cents,
                    'issued_at' => $order->paid_at ?? now(),
                    'paid_at' => $order->paid_at ?? now(),
                    'metadata' => ['order_reference' => $order->reference],
                ],
            );

            if (blank($invoice->number)) {
                $invoice->forceFill([
                    'number' => sprintf('AST-FAC-%s-%06d', now()->format('Y'), $invoice->id),
                ])->save();
            }

            return $invoice;
        });

        if ($sendMail && $order->user) {
            $this->mailer->user(
                $order->user,
                'Votre facture Astreon est disponible',
                'FACTURE DISPONIBLE',
                'Votre facture '.$invoice->number.' est prête',
                'Le paiement de votre commande '.$order->reference.' a bien été enregistré.',
                ['Vous pouvez télécharger votre facture PDF depuis le détail de votre commande.'],
                'Télécharger ma facture',
                route('client.invoices.download', $invoice),
                null,
                'success',
                ['Montant' => number_format($invoice->total_cents / 100, 2, ',', ' ').' €'],
            );
        }

        return $invoice;
    }
}
