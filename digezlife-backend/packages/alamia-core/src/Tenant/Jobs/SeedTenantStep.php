<?php

declare(strict_types=1);

namespace Alamia\Core\Tenant\Jobs;

use Alamia\Core\Tenant\Contracts\ProvisioningStep;
use Alamia\Core\Tenant\Models\Tenant;
use Illuminate\Support\Facades\Log;

/**
 * Provisioning Step: Seed the tenant with default data.
 *
 * Only runs if `tenant-engine.tenant.auto_seed_database` is true.
 * Seeders must use firstOrCreate / updateOrCreate to remain idempotent.
 */
final class SeedTenantStep implements ProvisioningStep
{
    public function handle(Tenant $tenant): void
    {
        if (! config('tenant-engine.tenant.auto_seed_database', false)) {
            Log::info('[Provisioning] Auto-seeding disabled — skipping seed step.', [
                'tenant_id' => $tenant->id,
            ]);

            return;
        }

        // TODO: Run configured tenant seeders (Phase 4+).
        // tenancy()->initialize($tenant);
        // Artisan::call('db:seed', ['--class' => TenantDatabaseSeeder::class, '--force' => true]);
        // tenancy()->end();
        Log::info('[Provisioning] Seed step placeholder — auto_seed_database not yet configured.', [
            'tenant_id' => $tenant->id,
        ]);
    }

    public function stepKey(): string
    {
        return 'seed-tenant';
    }
}
