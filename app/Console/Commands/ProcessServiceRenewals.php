<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Service;
use App\Services\Billing\AutoRenewalService;
use Illuminate\Console\Command;

final class ProcessServiceRenewals extends Command
{
    protected $signature = 'astreon:renew-services {--dry-run}';
    protected $description = 'Envoie les rappels et renouvelle les services arrivant à échéance.';

    public function handle(AutoRenewalService $renewals): int
    {
        Service::query()
            ->with(['user', 'plan'])
            ->whereNotNull('expires_at')
            ->whereBetween('expires_at', [now(), now()->addDays(3)])
            ->whereNull('renewal_reminded_at')
            ->chunkById(100, fn ($services) => $services->each(
                fn (Service $service) => $this->option('dry-run')
                    ? $this->line('Rappel : '.$service->reference)
                    : $renewals->sendReminder($service),
            ));

        Service::query()
            ->with(['user', 'plan'])
            ->where('auto_renew', true)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->whereNull('cancelled_at')
            ->chunkById(50, function ($services) use ($renewals): void {
                foreach ($services as $service) {
                    if ($this->option('dry-run')) {
                        $this->line('Renouvellement : '.$service->reference);
                        continue;
                    }
                    $this->line($service->reference.' : '.$renewals->process($service));
                }
            });

        return self::SUCCESS;
    }
}
