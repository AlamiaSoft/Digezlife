<?php

declare(strict_types=1);

namespace Alamia\Core\Tenant\Events;

use Alamia\Core\Shared\DTOs\TenantProvisioningData;
use Alamia\Core\Tenant\Models\Tenant;

/**
 * Fired when all core provisioning steps complete successfully.
 *
 * The TenantProvisioningData DTO is carried in-memory so host application
 * listeners (e.g. CreateWorkspaceOwner) can access the admin credentials
 * without them ever touching the database.
 */
final class TenantProvisioned
{
    public function __construct(
        public readonly Tenant $tenant,
        public readonly TenantProvisioningData $provisioningData,
    ) {}
}
