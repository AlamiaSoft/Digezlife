<?php

declare(strict_types=1);

namespace Alamia\Core\Tenant\Services;

use Alamia\Core\Shared\DTOs\TenantProvisioningData;
use Alamia\Core\Tenant\Events\TenantRegistered;
use Alamia\Core\Tenant\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * First-class orchestrator for tenant provisioning.
 *
 * Responsibilities:
 *  - Atomically creates the Tenant record inside a DB transaction.
 *  - Fires the Alamia-owned TenantRegistered event, which triggers
 *    the full provisioning pipeline via ProvisionTenantListener.
 *
 * Entry point for both the Livewire web UI and future Artisan CLI commands.
 * Never add web-specific logic here.
 *
 * Intentionally does NOT fire stancl's TenantCreated event directly.
 * stancl/tenancy is an implementation detail — our pipeline depends
 * only on Alamia-owned events.
 */
final class TenantProvisioningService
{
    /**
     * Provision a new tenant from the given data.
     *
     * The TenantProvisioningData DTO (including hashed credentials) lives
     * in PHP memory only. It is carried through events to host-app listeners
     * but is never written to the database.
     *
     * @throws Throwable if tenant creation or any provisioning step fails.
     */
    public function provision(TenantProvisioningData $data): Tenant
    {
        return DB::transaction(function () use ($data): Tenant {
            $tenant = Tenant::create([
                'id' => $data->subdomain,
                'name' => $data->tenantName,
                'plan' => $data->plan,
                'status' => config('tenant-engine.tenant.default_status', 'active'),
            ]);

            Log::info('[Provisioning] Tenant record created.', [
                'tenant_id' => $tenant->id,
                'tenant_name' => $tenant->name,
            ]);

            Event::dispatch(new TenantRegistered($tenant, $data));

            return $tenant->fresh();
        });
    }
}
