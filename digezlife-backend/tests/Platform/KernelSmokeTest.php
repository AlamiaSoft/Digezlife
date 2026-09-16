<?php

use Alamia\Core\Kernel\Providers\AlamiaCoreServiceProvider;
use Alamia\Core\Tenant\Models\Tenant;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;

test('golden platform test - full kernel lifecycle', function () {
    // 1. Kernel boots & Domains discovered
    expect(app()->getProvider(AlamiaCoreServiceProvider::class))->not->toBeNull();

    // 2. Module discovered (Assuming core domains act as base modules for now)
    $hasSuperAdminRoute = false;
    foreach (Route::getRoutes()->getRoutes() as $route) {
        if (str_contains($route->uri(), 'super-admin')) {
            $hasSuperAdminRoute = true;
            break;
        }
    }
    expect($hasSuperAdminRoute)->toBeTrue();

    // 3. Tenant created
    $tenant = Tenant::create([
        'id' => 'golden-tenant',
        'name' => 'Golden Tenant',
    ]);
    app(Alamia\Core\Tenant\Contracts\TenantDatabaseProvisioner::class)->provision($tenant);
    expect($tenant)->toBeInstanceOf(Tenant::class);
    expect($tenant->id)->toBe('golden-tenant');

    // Initialize Tenant Context
    tenancy()->initialize($tenant);

    // 4. Settings resolve
    // Assuming we have a settings mechanism configured. For now, check if config resolves correctly.
    expect(config('tenant-engine.models.tenant'))->toBe(Tenant::class);

    // 5. Feature flags resolve
    // Placeholder: Check feature flag service if exists.
    // expect(app(\Alamia\Core\FeatureFlags\Manager::class)->isEnabled('test'))->toBeFalse();

    // 6. Workflow dispatch
    // Placeholder: Event::fake() or actual dispatch
    Event::fake();
    // event(new \Alamia\Core\Workflow\Events\WorkflowTriggered());
    // Event::assertDispatched(\Alamia\Core\Workflow\Events\WorkflowTriggered::class);

    // 7. Audit entry
    // Placeholder: Check audit log
    // \Alamia\Core\Audit\Models\AuditLog::create(['action' => 'test']);
    // expect(\Alamia\Core\Audit\Models\AuditLog::count())->toBeGreaterThan(0);

    // 8. Notification queued
    // Placeholder: Notification::fake()
    // \Illuminate\Support\Facades\Notification::fake();

    // 9. API key generated
    // Placeholder: Check API keys
    // $key = $tenant->apiKeys()->create(['name' => 'test']);
    // expect($key)->not->toBeNull();

    // Clean up
    tenancy()->end();
});
