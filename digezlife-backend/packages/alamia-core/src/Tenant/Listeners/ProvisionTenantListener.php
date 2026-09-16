<?php

declare(strict_types=1);

namespace Alamia\Core\Tenant\Listeners;

use Alamia\Core\Tenant\Contracts\ProvisioningStep;
use Alamia\Core\Tenant\Events\TenantProvisioned;
use Alamia\Core\Tenant\Events\TenantProvisionFailed;
use Alamia\Core\Tenant\Events\TenantProvisionStarted;
use Alamia\Core\Tenant\Events\TenantProvisionStepCompleted;
use Alamia\Core\Tenant\Events\TenantProvisionStepStarted;
use Alamia\Core\Tenant\Events\TenantRegistered;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Executes the configured provisioning pipeline when a tenant is registered.
 *
 * Pipeline steps are resolved from the service container, so each step's
 * dependencies (e.g. TenantDatabaseProvisioner) are automatically injected.
 *
 * The pipeline is configured in tenant-engine.php under:
 *   tenant.provisioning.pipeline
 *
 * Steps can be appended by plugins/modules without modifying kernel code.
 */
final class ProvisionTenantListener
{
    public function handle(TenantRegistered $event): void
    {
        $tenant = $event->tenant;
        $failedStepKey = null;

        Event::dispatch(new TenantProvisionStarted($tenant));

        Log::info('[Provisioning] Starting provisioning pipeline.', ['tenant_id' => $tenant->id]);

        try {
            /** @var array<class-string<ProvisioningStep>> $pipeline */
            $pipeline = config('tenant-engine.tenant.provisioning.pipeline', []);

            foreach ($pipeline as $stepClass) {
                /** @var ProvisioningStep $step */
                $step = app($stepClass);
                $failedStepKey = $step->stepKey();

                Event::dispatch(new TenantProvisionStepStarted($tenant, $step->stepKey()));

                $step->handle($tenant);

                Event::dispatch(new TenantProvisionStepCompleted($tenant, $step->stepKey()));

                Log::info('[Provisioning] Step completed.', [
                    'tenant_id' => $tenant->id,
                    'step' => $step->stepKey(),
                ]);
            }

            Event::dispatch(new TenantProvisioned($tenant, $event->provisioningData));

            Log::info('[Provisioning] Tenant provisioning complete.', ['tenant_id' => $tenant->id]);
        } catch (Throwable $e) {
            Log::error('[Provisioning] Provisioning failed.', [
                'tenant_id' => $tenant->id,
                'failed_step' => $failedStepKey,
                'error' => $e->getMessage(),
            ]);

            Event::dispatch(new TenantProvisionFailed($tenant, $e, $failedStepKey));

            throw $e;
        }
    }
}
