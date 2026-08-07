<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <style>
        body{font-family:DejaVu Sans,sans-serif;color:#171126;font-size:12px;margin:36px}
        .header{display:flex;justify-content:space-between;border-bottom:3px solid #7c3aed;padding-bottom:18px}
        .brand{font-size:26px;font-weight:800;color:#7c3aed}.muted{color:#6b7280}.right{text-align:right}
        .box{margin-top:24px;border:1px solid #e5e7eb;border-radius:10px;padding:16px}
        table{width:100%;border-collapse:collapse;margin-top:24px}th{background:#171126;color:white;text-align:left;padding:10px}
        td{padding:10px;border-bottom:1px solid #e5e7eb}.amount{text-align:right}.total{font-size:18px;font-weight:800;color:#7c3aed}
        .footer{margin-top:35px;border-top:1px solid #e5e7eb;padding-top:14px;color:#6b7280;font-size:10px}
    </style>
</head>
<body>
<div class="header">
    <div><div class="brand">ASTREON</div><div class="muted">Hébergement Gaming, VPS & Web</div></div>
    <div class="right"><strong>FACTURE {{ $invoice->number }}</strong><br>Date : {{ $invoice->issued_at?->format('d/m/Y') }}<br>Statut : Payée</div>
</div>
<div class="box">
    <strong>Facturé à</strong><br>
    {{ $invoice->order?->billing_name ?? $invoice->user?->name }}<br>
    {{ $invoice->order?->billing_address }}<br>
    {{ $invoice->order?->billing_postal_code }} {{ $invoice->order?->billing_city }}<br>
    {{ $invoice->order?->billing_country }}<br>
    {{ $invoice->order?->billing_email ?? $invoice->user?->email }}
</div>
<table>
<thead><tr><th>Produit</th><th>Plan</th><th>Qté</th><th class="amount">Montant</th></tr></thead>
<tbody>
@foreach($invoice->order?->items ?? [] as $item)
<tr><td>{{ $item->product_name }}</td><td>{{ $item->plan_name }}</td><td>{{ $item->quantity }}</td><td class="amount">{{ number_format($item->line_total_cents/100,2,',',' ') }} €</td></tr>
@endforeach
<tr><td colspan="3">Sous-total</td><td class="amount">{{ number_format($invoice->subtotal_cents/100,2,',',' ') }} €</td></tr>
@if($invoice->discount_cents > 0)<tr><td colspan="3">Remise</td><td class="amount">-{{ number_format($invoice->discount_cents/100,2,',',' ') }} €</td></tr>@endif
<tr><td colspan="3">TVA</td><td class="amount">{{ number_format($invoice->tax_total_cents/100,2,',',' ') }} €</td></tr>
<tr><td colspan="3" class="total">TOTAL</td><td class="amount total">{{ number_format($invoice->total_cents/100,2,',',' ') }} €</td></tr>
</tbody>
</table>
<div class="footer">Facture générée automatiquement par Astreon. Conservez ce document pour votre comptabilité.</div>
</body></html>
