<?php

declare(strict_types=1);

namespace Alamia\Core\Tenant\Events;

use Alamia\Core\Tenant\Models\Tenant;
use Throwable;

/** Fired when any provisioning step throws an exception. */
final class TenantProvisionFailed
{
    public function __construct(
        public readonly Tenant $tenant,
        public readonly Throwable $exception,
        public readonly ?string $failedStepKey = null,
    ) {}
}
