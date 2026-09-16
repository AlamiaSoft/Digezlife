<?php

use App\Models\User;
use Illuminate\Support\Facades\Artisan;

beforeEach(function () {
    Artisan::call('migrate');
});

test('super admin can start impersonation', function () {
    $superAdmin = Alamia\Core\Authorization\Models\SuperAdmin::create([
        'name' => 'Super Admin',
        'email' => 'super@admin.com',
        'password' => bcrypt('password'),
        'status' => 'active',
    ]);

    $targetUser = User::factory()->create();

    Laravel\Sanctum\Sanctum::actingAs($superAdmin, ['*']);
    $response = test()->postJson('/api/v1/super-admin/impersonate/'.$targetUser->external_id);
    $response->assertStatus(200)
        ->assertJsonPath('data.attributes.message', 'Impersonation started successfully')
        ->assertJsonStructure(['data' => ['attributes' => ['token']]]);
});

test('non super admin cannot start impersonation', function () {
    $user = User::factory()->create();
    $targetUser = User::factory()->create();

    Laravel\Sanctum\Sanctum::actingAs($user, ['*']);
    $response = test()->postJson('/api/v1/super-admin/impersonate/'.$targetUser->external_id);

    $response->assertStatus(403);
});

test('super admin can stop impersonation', function () {
    $superAdmin = Alamia\Core\Authorization\Models\SuperAdmin::create([
        'name' => 'Super Admin 2',
        'email' => 'super2@admin.com',
        'password' => bcrypt('password'),
        'status' => 'active',
    ]);

    $targetUser = User::factory()->create();

    // Start impersonation to get token and set session
    Laravel\Sanctum\Sanctum::actingAs($superAdmin, ['*']);
    $response = test()->postJson('/api/v1/super-admin/impersonate/'.$targetUser->external_id);

    $token = $response->json('attributes.token');

    // Make request as super admin to stop impersonation
    // Also we need to fix the delete() call on TransientToken in controller by mocking a real token,
    // or just let it be since we use Sanctum::actingAs which returns TransientToken.
    // Let's modify the ImpersonationController to check for method_exists.
    Laravel\Sanctum\Sanctum::actingAs($superAdmin, ['*']);
    $response = test()->postJson('/api/v1/super-admin/impersonate/stop');

    $response->assertStatus(200)
        ->assertJsonPath('data.attributes.message', 'Impersonation stopped successfully');
});
