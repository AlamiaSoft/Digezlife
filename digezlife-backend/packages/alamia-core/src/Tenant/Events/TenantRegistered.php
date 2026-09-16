<?php

declare(strict_types=1);

namespace Alamia\Core\Tenant\Events;

use Alamia\Core\Shared\DTOs\TenantProvisioningData;
use Alamia\Core\Tenant\Models\Tenant;

/**
 * Fired by TenantProvisioningService immediately after a Tenant record is created.
 *
 * This is an Alamia-owned event. It is NOT Stancl's TenantCreated event.
 * The entire provisioning pipeline is anchored to this event, making stancl
 * an implementation detail that can be swapped without changing any orchestration logic.
 */
final class TenantRegistered
{
    public function __construct(
        public readonly Tenant $tenant,
        public readonly TenantProvisioningData $provisioningData,
    ) {}
}
