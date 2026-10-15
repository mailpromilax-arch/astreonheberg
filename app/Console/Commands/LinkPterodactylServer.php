<?php

namespace App\Console\Commands;

use App\Models\Service;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class LinkPterodactylServer extends Command
{
    protected $signature = 'ptero:link
        {external_id : ID numérique du serveur Pterodactyl}
        {email : Email du compte client}
        {--plan= : ID du product_plan (optionnel)}
        {--name= : Nom du service (optionnel)}';

    protected $description = 'Associe un serveur Pterodactyl existant à un compte client';

    public function handle(): int
    {
        $user = User::where('email', $this->argument('email'))->first();

        if (! $user) {
            $this->error('Aucun utilisateur avec cet email.');
            return self::FAILURE;
        }

        $externalId = (string) $this->argument('external_id');

        if (Service::where('external_id', $externalId)->exists()) {
            $this->error('Ce serveur est déjà lié à un service.');
            return self::FAILURE;
        }

        $panelUrl = rtrim((string) config('services.pterodactyl.url'), '/');

        $service = Service::create([
            'user_id' => $user->id,
            'product_plan_id' => $this->option('plan') ?: null,
            'reference' => 'SRV-'.now()->format('Ymd').'-'.Str::upper(Str::random(8)),
            'name' => $this->option('name') ?: 'Serveur lié manuellement',
            'status' => 'active',
            'provider' => 'pterodactyl',
            'external_id' => $externalId,
            'external_url' => $panelUrl,
            'activated_at' => now(),
            'expires_at' => now()->addMonth(),
            'auto_renew' => false,
            'metadata' => ['linked_manually' => true],
        ]);

        $this->info("Service {$service->reference} créé et lié à {$user->email}.");

        return self::SUCCESS;
    }
}