<?php

declare(strict_types=1);

namespace Alamia\Core\Tenant\Jobs;

use Alamia\Core\Tenant\Contracts\ProvisioningStep;
use Alamia\Core\Tenant\Contracts\TenantDatabaseProvisioner;
use Alamia\Core\Tenant\Models\Tenant;

/**
 * Provisioning Step: Provision the tenant's database.
 *
 * Delegates entirely to the bound TenantDatabaseProvisioner implementation.
 * By default this resolves to SharedConnectionProvisioner (intentional no-op).
 * For dedicated databases, bind DedicatedDatabaseProvisioner instead.
 */
final class ProvisionDatabaseStep implements ProvisioningStep
{
    public function __construct(
        private readonly TenantDatabaseProvisioner $provisioner,
    ) {}

    public function handle(Tenant $tenant): void
    {
        $this->provisioner->provision($tenant);
    }

    public function stepKey(): string
    {
        return 'provision-database';
    }
}
