<?php

declare(strict_types=1);

namespace Alamia\Core\Tenant\Events;

use Alamia\Core\Tenant\Models\Tenant;

/** Fired just before a provisioning step begins executing. */
final class TenantProvisionStepStarted
{
    public function __construct(
        public readonly Tenant $tenant,
        public readonly string $stepKey,
    ) {}
}
