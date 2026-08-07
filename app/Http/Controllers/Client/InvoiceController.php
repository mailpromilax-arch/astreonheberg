<?php

declare(strict_types=1);

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class InvoiceController extends Controller
{
    public function download(Request $request, Invoice $invoice): Response
    {
        abort_unless($invoice->user_id === $request->user()->id, 403);

        $invoice->loadMissing(['user', 'order.items']);

        return Pdf::loadView('invoices.astreon', ['invoice' => $invoice])
            ->setPaper('a4')
            ->download($invoice->number.'.pdf');
    }
}
