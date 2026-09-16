<?php

declare(strict_types=1);

namespace Alamia\Core\Tenant\Contracts;

use Alamia\Core\Tenant\Models\Tenant;

/**
 * Contract for provisioning a tenant's database connection.
 *
 * Implementations:
 *  - SharedConnectionProvisioner: tenants share the central DB (default, dev/simple SaaS)
 *  - DedicatedDatabaseProvisioner: each tenant gets their own DB (enterprise/isolation)
 *
 * Swap implementations via the service container binding — no other code changes required.
 */
interface TenantDatabaseProvisioner
{
    /**
     * Provision the database resources for this tenant.
     * Must be idempotent.
     */
    public function provision(Tenant $tenant): void;

    /**
     * Tear down the database resources for this tenant.
     * Called on tenant deletion.
     * Must be idempotent.
     */
    public function teardown(Tenant $tenant): void;
}
