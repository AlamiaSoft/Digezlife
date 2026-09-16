<?php

declare(strict_types=1);

namespace Alamia\Core\Tenant\Contracts;

use Alamia\Core\Tenant\Models\Tenant;

/**
 * Contract for a single step in the tenant provisioning pipeline.
 *
 * Every step must be idempotent — safe to run more than once.
 * This allows for safe retries without side effects.
 */
interface ProvisioningStep
{
    /**
     * Execute this provisioning step for the given tenant.
     */
    public function handle(Tenant $tenant): void;

    /**
     * A unique, machine-readable key identifying this step.
     * Used for Journey tracking and event payloads.
     *
     * Example: 'create-domain', 'provision-database', 'run-migrations'
     */
    public function stepKey(): string;
}
