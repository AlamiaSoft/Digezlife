<?php

declare(strict_types=1);

namespace Alamia\Core\Tenant\Jobs;

use Alamia\Core\Tenant\Contracts\ProvisioningStep;
use Alamia\Core\Tenant\Models\Tenant;
use Illuminate\Support\Facades\Log;

/**
 * Provisioning Step: Run tenant-specific migrations.
 *
 * In shared-connection mode (single database), all migrations are run centrally
 * via the standard `php artisan migrate` command, so this step is a no-op.
 *
 * In dedicated-database mode, this step would run migrations against
 * the tenant's own database connection.
 */
final class RunMigrationsStep implements ProvisioningStep
{
    public function handle(Tenant $tenant): void
    {
        $isDedicatedMode = config('tenant-engine.tenant.auto_create_database', false);

        if (! $isDedicatedMode) {
            Log::info('[Provisioning] Shared connection mode — migrations run centrally, skipping tenant migrations.', [
                'tenant_id' => $tenant->id,
            ]);

            return;
        }

        // TODO: Run tenant-specific migrations for dedicated DB mode (Phase 4+).
        // tenancy()->initialize($tenant);
        // Artisan::call('migrate', ['--database' => 'tenant', '--force' => true]);
        // tenancy()->end();
        Log::info('[Provisioning] Dedicated mode migration placeholder — not yet implemented.', [
            'tenant_id' => $tenant->id,
        ]);
    }

    public function stepKey(): string
    {
        return 'run-migrations';
    }
}
