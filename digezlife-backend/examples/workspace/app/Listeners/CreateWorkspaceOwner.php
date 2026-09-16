<?php

namespace App\Listeners;

use Alamia\Core\Tenant\Events\TenantProvisioned;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * Creates the first admin user for a newly provisioned workspace.
 *
 * Listens to the Alamia-owned TenantProvisioned event.
 * The PlainPassword value object in the DTO ensures credentials
 * are never written to the database — only the bcrypt hash is stored.
 */
class CreateWorkspaceOwner
{
    public function handle(TenantProvisioned $event): void
    {
        $tenant = $event->tenant;
        $data = $event->provisioningData;

        tenancy()->initialize($tenant);

        User::firstOrCreate(
            ['email' => $data->adminEmail],
            [
                'name' => 'Admin of '.$data->tenantName,
                'password' => $data->adminPassword->hashed(),
                'external_id' => (string) Str::uuid(),
            ]
        );

        tenancy()->end();
    }
}
