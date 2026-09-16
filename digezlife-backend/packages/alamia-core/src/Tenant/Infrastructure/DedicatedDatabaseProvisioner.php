<?php

declare(strict_types=1);

namespace Alamia\Core\Tenant\Infrastructure;

use Alamia\Core\Tenant\Contracts\TenantDatabaseProvisioner;
use Alamia\Core\Tenant\Models\Tenant;
use Illuminate\Support\Facades\Log;

/**
 * Dedicated Database Provisioner.
 *
 * Each tenant gets their own dedicated database (enterprise / full isolation mode).
 * This provisioner delegates to stancl/tenancy's database management under the hood.
 *
 * To activate: bind this class to TenantDatabaseProvisioner in the service container.
 * No provisioning pipeline code changes are required.
 *
 * @todo Implement stancl CreateDatabase / DeleteDatabase delegation when
 *       dedicated database mode is enabled (Phase 4+).
 */
final class DedicatedDatabaseProvisioner implements TenantDatabaseProvisioner
{
    public function provision(Tenant $tenant): void
    {
        Log::info('[Provisioning] Dedicated database mode — provisioning tenant DB.', [
            'tenant_id' => $tenant->id,
            'mode' => 'dedicated-database',
        ]);

        // Create the database (e.g. touch sqlite file, or create mysql db)
        $tenant->database()->makeCredentials();
        $tenant->database()->manager()->createDatabase($tenant);

        // Run migrations
        \Illuminate\Support\Facades\Artisan::call('tenants:migrate', [
            '--tenants' => [$tenant->id],
        ]);
    }

    public function teardown(Tenant $tenant): void
    {
        Log::info('[Provisioning] Dedicated database mode — tearing down tenant DB.', [
            'tenant_id' => $tenant->id,
            'mode' => 'dedicated-database',
        ]);

        $tenant->database()->manager()->deleteDatabase($tenant);
    }
}
