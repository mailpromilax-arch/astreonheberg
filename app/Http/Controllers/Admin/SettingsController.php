<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

final class SettingsController extends Controller
{
    public function index(): Response
    {
        abort_unless(Schema::hasTable('settings'), 404);

        return Inertia::render('admin/settings/index', [
            'settings' => [
                'general' => [
                    'site_name' => $this->get('general.site_name', config('app.name', 'Astreon')),
                    'site_url' => $this->get('general.site_url', config('app.url')),
                    'support_email' => $this->get('general.support_email', ''),
                    'default_locale' => $this->get('general.default_locale', 'fr'),
                    'timezone' => $this->get('general.timezone', config('app.timezone', 'UTC')),
                ],
                'access' => [
                    'registrations_enabled' => $this->bool('access.registrations_enabled', true),
                    'maintenance_enabled' => $this->bool('access.maintenance_enabled', false),
                    'email_verification_required' => $this->bool('access.email_verification_required', true),
                ],
                'billing' => [
                    'company_name' => $this->get('billing.company_name', 'AstreonHeberg'),
                    'company_address' => $this->get('billing.company_address', ''),
                    'company_vat' => $this->get('billing.company_vat', ''),
                    'currency' => $this->get('billing.currency', 'EUR'),
                    'invoice_prefix' => $this->get('billing.invoice_prefix', 'AST'),
                    'tax_rate' => (float) $this->get('billing.tax_rate', '0'),
                ],
                'support' => [
                    'ticket_auto_close_days' => (int) $this->get('support.ticket_auto_close_days', '7'),
                    'max_attachments' => (int) $this->get('support.max_attachments', '5'),
                    'max_attachment_size_mb' => (int) $this->get('support.max_attachment_size_mb', '10'),
                ],
            ],
            'environment' => [
                'app_env' => config('app.env'),
                'debug' => (bool) config('app.debug'),
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'queue_connection' => config('queue.default'),
                'cache_store' => config('cache.default'),
                'mail_mailer' => config('mail.default'),
                'pterodactyl_configured' => $this->pterodactylConfigured(),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'general.site_name' => ['required', 'string', 'max:100'],
            'general.site_url' => ['nullable', 'url', 'max:255'],
            'general.support_email' => ['nullable', 'email', 'max:255'],
            'general.default_locale' => ['required', Rule::in(['fr', 'en'])],
            'general.timezone' => ['required', 'timezone'],

            'access.registrations_enabled' => ['required', 'boolean'],
            'access.maintenance_enabled' => ['required', 'boolean'],
            'access.email_verification_required' => ['required', 'boolean'],

            'billing.company_name' => ['required', 'string', 'max:255'],
            'billing.company_address' => ['nullable', 'string', 'max:2000'],
            'billing.company_vat' => ['nullable', 'string', 'max:100'],
            'billing.currency' => ['required', Rule::in(['EUR', 'USD', 'GBP', 'CHF'])],
            'billing.invoice_prefix' => ['required', 'alpha_num', 'max:10'],
            'billing.tax_rate' => ['required', 'numeric', 'min:0', 'max:100'],

            'support.ticket_auto_close_days' => ['required', 'integer', 'min:0', 'max:365'],
            'support.max_attachments' => ['required', 'integer', 'min:0', 'max:20'],
            'support.max_attachment_size_mb' => ['required', 'integer', 'min:1', 'max:100'],
        ]);

        foreach ($validated as $group => $values) {
            foreach ($values as $key => $value) {
                $this->put(
                    "{$group}.{$key}",
                    $value,
                    is_bool($value)
                        ? 'boolean'
                        : (is_numeric($value) ? 'number' : 'string'),
                );
            }
        }

        $this->log($request);

        return back()->with('success', 'Paramètres enregistrés.');
    }

    private function get(string $key, mixed $default = null): mixed
    {
        $value = DB::table('settings')
            ->where('key', $key)
            ->value('value');

        return $value ?? $default;
    }

    private function bool(string $key, bool $default): bool
    {
        $value = $this->get($key);

        if ($value === null) {
            return $default;
        }

        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    private function put(
        string $key,
        mixed $value,
        string $type,
    ): void {
        [$group] = explode('.', $key, 2);

        DB::table('settings')->updateOrInsert(
            ['key' => $key],
            [
                'group' => $group,
                'value' => is_bool($value)
                    ? ($value ? '1' : '0')
                    : (string) $value,
                'type' => $type,
                'is_public' => false,
                'updated_at' => now(),
                'created_at' => DB::raw('COALESCE(created_at, CURRENT_TIMESTAMP)'),
            ],
        );
    }

    private function pterodactylConfigured(): bool
    {
        $url = config('services.pterodactyl.url')
            ?? config('pterodactyl.url')
            ?? env('PTERODACTYL_URL')
            ?? env('PTERODACTYL_PANEL_URL');

        $key = config('services.pterodactyl.application_key')
            ?? config('services.pterodactyl.api_key')
            ?? env('PTERODACTYL_APPLICATION_API_KEY')
            ?? env('PTERODACTYL_API_KEY');

        return filled($url) && filled($key);
    }

    private function log(Request $request): void
    {
        if (! Schema::hasTable('admin_logs')) {
            return;
        }

        $payload = [];

        foreach ([
            'user_id' => $request->user()?->id,
            'action' => 'settings.updated',
            'description' => 'Paramètres généraux de la plateforme mis à jour.',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => json_encode([
                'groups' => ['general', 'access', 'billing', 'support'],
            ], JSON_THROW_ON_ERROR),
            'created_at' => now(),
            'updated_at' => now(),
        ] as $column => $value) {
            if (Schema::hasColumn('admin_logs', $column)) {
                $payload[$column] = $value;
            }
        }

        if ($payload !== []) {
            DB::table('admin_logs')->insert($payload);
        }
    }
}
