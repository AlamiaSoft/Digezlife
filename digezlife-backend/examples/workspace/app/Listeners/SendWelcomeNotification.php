<?php

namespace App\Listeners;

use Alamia\Core\Tenant\Events\TenantProvisioned;
use Illuminate\Support\Facades\Log;

/**
 * Sends a welcome notification to the new workspace owner.
 *
 * Placeholder: wire up Mailpit/SMTP and a Mailable when email is configured.
 */
class SendWelcomeNotification
{
    public function handle(TenantProvisioned $event): void
    {
        // TODO: Dispatch a WelcomeEmail mailable to $event->provisioningData->adminEmail
        Log::info('[Workspace] Welcome notification placeholder — wire up Mailable when ready.', [
            'tenant_id' => $event->tenant->id,
            'admin_email' => $event->provisioningData->adminEmail,
        ]);
    }
}
