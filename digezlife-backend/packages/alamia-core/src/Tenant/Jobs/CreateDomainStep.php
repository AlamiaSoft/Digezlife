<?php

declare(strict_types=1);

namespace Alamia\Core\Tenant\Jobs;

use Alamia\Core\Tenant\Contracts\ProvisioningStep;
use Alamia\Core\Tenant\Models\Tenant;
use Illuminate\Support\Facades\Log;

/**
 * Provisioning Step: Create the tenant's subdomain.
 *
 * Idempotent — uses firstOrCreate so re-running never throws a duplicate key error.
 * The domain format is: {tenant_id}.{first_central_domain}
 */
final class CreateDomainStep implements ProvisioningStep
{
    public function handle(Tenant $tenant): void
    {
        // Prefer a dedicated config, fallback to stancl's first central domain, defaulting to 'localhost'
        $centralDomain = config('tenant-engine.tenant.central_domain');

        if (empty($centralDomain)) {
            $domains = config('tenancy.central_domains', []);
            // In local development, stancl puts 127.0.0.1 first, but browsers use .localhost
            $centralDomain = in_array('localhost', $domains, true) ? 'localhost' : ($domains[0] ?? 'localhost');
        }
        $domain = $tenant->id.'.'.$centralDomain;

        $tenant->domains()->firstOrCreate(['domain' => $domain]);

        Log::info('[Provisioning] Domain created.', [
            'tenant_id' => $tenant->id,
            'domain' => $domain,
        ]);
    }

    public function stepKey(): string
    {
        return 'create-domain';
    }
}
