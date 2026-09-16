<?php

use Alamia\Core\Tenant\Models\Tenant;
use Amrshah\Arbac\Facades\Arbac;
use App\Models\User;

test('tenant admin can list roles', function () {
    $tenantId = 'acme_'.uniqid();
    $tenant = Tenant::create(['id' => $tenantId]);
    app(Alamia\Core\Tenant\Contracts\TenantDatabaseProvisioner::class)->provision($tenant);
    $tenant->activate();
    $user = User::factory()->create();

    // Attach user to tenant as admin
    $tenant->users()->attach($user->id, ['role' => 'admin']);

    // Switch to tenant context
    tenancy()->initialize($tenant);

    // Create a role in tenant database
    Arbac::createRole('editor', 'Editor');

    $response = test()->actingAs($user)
        ->get("/{$tenantId}/api/v1/roles");

    $response->assertStatus(200)
        ->assertJsonCount(2, 'data')
        ->assertJsonFragment(['name' => 'editor']);
});

test('non admin cannot manage roles', function () {
    $tenantId = 'acme_'.uniqid();
    $tenant = Tenant::create(['id' => $tenantId]);
    app(Alamia\Core\Tenant\Contracts\TenantDatabaseProvisioner::class)->provision($tenant);
    $tenant->activate();
    $user = User::factory()->create();

    // Attach user as standard user
    $tenant->users()->attach($user->id, ['role' => 'user']);

    $response = test()->actingAs($user)
        ->postJson("/{$tenantId}/api/v1/roles", [
            'name' => 'manager',
        ]);

    $response->assertStatus(403);
});

test('tenant admin can create role', function () {
    $tenantId = 'acme_'.uniqid();
    $tenant = Tenant::create(['id' => $tenantId]);
    app(Alamia\Core\Tenant\Contracts\TenantDatabaseProvisioner::class)->provision($tenant);
    $tenant->activate();
    $user = User::factory()->create();
    $tenant->users()->attach($user->id, ['role' => 'admin']);

    $response = test()->actingAs($user)
        ->postJson("/{$tenantId}/api/v1/roles", [
            'name' => 'manager',
            'display_name' => 'Manager',
        ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.attributes.name', 'manager');
});
