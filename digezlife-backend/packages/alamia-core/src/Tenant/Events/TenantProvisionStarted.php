<?php

declare(strict_types=1);

namespace Alamia\Core\Tenant\Events;

use Alamia\Core\Tenant\Models\Tenant;

/** Fired when the provisioning pipeline begins for a tenant. */
final class TenantProvisionStarted
{
    public function __construct(public readonly Tenant $tenant) {}
}
