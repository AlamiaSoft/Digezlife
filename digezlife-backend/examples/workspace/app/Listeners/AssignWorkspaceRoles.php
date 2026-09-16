<?php

namespace App\Listeners;

use Alamia\Core\Tenant\Events\TenantProvisioned;
use Illuminate\Support\Facades\Log;

/**
 * Assigns default roles to the newly created workspace owner.
 *
 * Placeholder: extend this when spatie/permission role seeding
 * for the tenant admin is required.
 */
class AssignWorkspaceRoles
{
    public function handle(TenantProvisioned $event): void
    {
        // TODO: Assign 'admin' role to the workspace owner via spatie/permission.
        // tenancy()->initialize($event->tenant);
        // $user = User::where('email', $event->provisioningData->adminEmail)->first();
        // $user?->assignRole('admin');
        // tenancy()->end();

        Log::info('[Workspace] Role assignment placeholder — extend when roles are configured.', [
            'tenant_id' => $event->tenant->id,
        ]);
    }
}
