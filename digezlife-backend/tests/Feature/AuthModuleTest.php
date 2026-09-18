<?php

namespace Tests\Feature;

use Alamia\Core\Tenant\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthModuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_register_user_and_auto_provision_household(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Kashif Ali',
            'email' => 'kashif@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'type',
                    'id',
                    'attributes' => ['name', 'email'],
                ],
                'meta' => [
                    'token',
                    'household' => ['id', 'name'],
                ],
            ]);

        $this->assertDatabaseHas('users', ['email' => 'kashif@example.com']);
    }

    public function test_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('Secret123!'),
        ]);

        $tenant = Tenant::create([
            'id' => 'household-auth-test',
            'name' => 'Auth Household',
            'status' => 'active',
        ]);
        $user->tenants()->attach($tenant->id, ['status' => 'active', 'is_owner' => true]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'Secret123!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'type',
                    'id',
                    'attributes' => ['name', 'email'],
                ],
                'meta' => [
                    'token',
                    'household' => ['id', 'name'],
                ],
            ]);
    }

    public function test_can_fetch_and_update_profile(): void
    {
        $user = User::factory()->create([
            'name' => 'Original Name',
            'email' => 'profile@example.com',
        ]);

        Sanctum::actingAs($user, ['*']);

        // Fetch profile
        $this->getJson('/api/v1/profile')
            ->assertStatus(200)
            ->assertJsonPath('data.attributes.name', 'Original Name');

        // Update profile
        $this->patchJson('/api/v1/profile', [
            'name' => 'Updated Name',
            'phone' => '03009876543',
        ])->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
        ]);
    }
}