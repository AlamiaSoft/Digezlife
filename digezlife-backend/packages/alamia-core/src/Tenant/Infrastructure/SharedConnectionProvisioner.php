<?php

declare(strict_types=1);

namespace Alamia\Core\Tenant\Infrastructure;

use Alamia\Core\Tenant\Contracts\TenantDatabaseProvisioner;
use Alamia\Core\Tenant\Models\Tenant;
use Illuminate\Support\Facades\Log;

/**
 * Shared Connection Provisioner.
 *
 * All tenants share the central database connection (single-database tenancy).
 * This is the default mode for dev, CI, and simple SaaS deployments.
 *
 * Both methods are intentional no-ops — this is a valid production code path,
 * not a workaround or a patch. The log entries serve as audit trail.
 *
 * To switch to dedicated databases, bind DedicatedDatabaseProvisioner in the
 * service container. No other code changes are required.
 */
final class SharedConnectionProvisioner implements TenantDatabaseProvisioner
{
    public function provision(Tenant $tenant): void
    {
        Log::info('[Provisioning] Shared connection mode — no separate DB to provision.', [
            'tenant_id' => $tenant->id,
            'mode' => 'shared-connection',
        ]);
    }

    public function teardown(Tenant $tenant): void
    {
        Log::info('[Provisioning] Shared connection mode — no DB to tear down.', [
            'tenant_id' => $tenant->id,
            'mode' => 'shared-connection',
        ]);
    }
}
