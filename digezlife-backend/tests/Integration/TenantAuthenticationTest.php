<?php

use Alamia\Core\Tenant\Models\Tenant;
use App\Models\User;

test('authenticated user can access tenant routes if they belong to it', function () {
    $tenantId = 'acme_'.uniqid();
    $tenant = Tenant::create(['id' => $tenantId, 'status' => 'active']);
    app(Alamia\Core\Tenant\Contracts\TenantDatabaseProvisioner::class)->provision($tenant);

    // Create a user and attach to tenant
    $user = User::factory()->create();
    $tenant->users()->attach($user->id, ['role' => 'admin']);

    // Dump all routes
    $response = test()->actingAs($user)
        ->get("/{$tenantId}/api/v1/settings");

    // We expect it to pass middleware and hit the controller (which might return 200 or 500 depending on implementation)
    // At minimum, it shouldn't be 401 (unauthorized) or 403 or 404 (due to tenancy)
    expect($response->status())->not->toBe(401)
        ->and($response->status())->not->toBe(403)
        ->and($response->status())->not->toBe(404);
});
