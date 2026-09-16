<?php

use Alamia\Core\Tenant\Models\Tenant;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByPath;

test('tenant can be resolved via path', function () {
    $tenantId = 'acme_'.uniqid();
    $tenant = Tenant::create(['id' => $tenantId]);
    app(Alamia\Core\Tenant\Contracts\TenantDatabaseProvisioner::class)->provision($tenant);

    // Define a route that uses path initialization
    Route::middleware([InitializeTenancyByPath::class])
        ->get('/{tenant}/test-resolution', fn () => response()->json([
            'resolved_tenant' => tenant('id'),
        ]));

    $response = test()->get("/{$tenantId}/test-resolution");

    $response->assertStatus(200)
        ->assertJson(['resolved_tenant' => $tenantId]);

    // Clean up
    // $tenant->delete();
});
