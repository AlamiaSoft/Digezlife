<?php

declare(strict_types=1);

namespace Alamia\Core\Tenant\Events;

use Alamia\Core\Tenant\Models\Tenant;

/** Fired after a provisioning step completes successfully. */
final class TenantProvisionStepCompleted
{
    public function __construct(
        public readonly Tenant $tenant,
        public readonly string $stepKey,
    ) {}
}
