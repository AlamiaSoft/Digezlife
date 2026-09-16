<?php

declare(strict_types=1);

namespace Alamia\Core\Shared\DTOs;

use Alamia\Core\Shared\ValueObjects\PlainPassword;

/**
 * Carries all data needed to provision a new tenant.
 *
 * This DTO lives in PHP memory only. It is never persisted to the database.
 * The PlainPassword value object prevents accidental credential logging.
 */
final class TenantProvisioningData
{
    public function __construct(
        public readonly string $subdomain,
        public readonly string $tenantName,
        public readonly string $adminEmail,
        public readonly PlainPassword $adminPassword,
        public readonly string $plan = 'free',
    ) {}
}
