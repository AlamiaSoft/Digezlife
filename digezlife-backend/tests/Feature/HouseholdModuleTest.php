<?php

namespace Tests\Feature;

use Alamia\Core\Tenant\Models\Tenant;
use App\Models\TenantInvitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class HouseholdModuleTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;
    protected User $owner;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'id' => 'household-test-family',
            'name' => 'Alamia Family',
            'status' => 'active',
            'max_seats' => 5,
        ]);

        $this->owner = User::factory()->create([
            'name' => 'Ali Raza',
            'email' => 'ali@example.com',
        ]);

        $this->owner->tenants()->attach($this->tenant->id, [
            'is_owner' => true,
            'status' => 'active',
            'joined_at' => now(),
        ]);

        Sanctum::actingAs($this->owner, ['*']);
    }

    public function test_can_list_household_members(): void
    {
        $response = $this->getJson('/api/v1/household/members');

        $response->assertStatus(200)
            ->assertJsonPath('data.household.id', $this->tenant->id)
            ->assertJsonPath('data.household.name', 'Alamia Family')
            ->assertJsonPath('data.household.activeCount', 1)
            ->assertJsonPath('data.members.0.name', 'Ali Raza')
            ->assertJsonPath('data.members.0.role', 'owner');
    }

    public function test_can_create_and_cancel_invitation(): void
    {
        // 1. Create invite
        $inviteRes = $this->postJson('/api/v1/household/invitations', [
            'recipient' => '03001234567',
            'role' => 'member',
        ]);

        $inviteRes->assertStatus(201)
            ->assertJsonPath('data.recipient', '03001234567')
            ->assertJsonPath('data.role', 'member');

        $inviteId = $inviteRes->json('data.id');

        // 2. Cancel invite
        $cancelRes = $this->deleteJson("/api/v1/household/invitations/{$inviteId}");
        $cancelRes->assertStatus(200);

        // Verify invite is gone
        $this->assertDatabaseMissing('tenant_invitations', ['id' => $inviteId]);
    }

    public function test_new_member_can_join_household_via_invite_token(): void
    {
        $invitation = TenantInvitation::create([
            'tenant_id' => $this->tenant->id,
            'email' => 'spouse@example.com',
            'role' => 'member',
            'token' => Str::random(32),
            'expires_at' => now()->addDays(7),
        ]);

        $newMember = User::factory()->create([
            'name' => 'Fatima Ali',
            'email' => 'spouse@example.com',
        ]);

        Sanctum::actingAs($newMember, ['*']);

        $joinRes = $this->postJson('/api/v1/household/join', [
            'code' => $invitation->token,
        ]);

        $joinRes->assertStatus(200)
            ->assertJsonPath('data.household.id', $this->tenant->id);

        $this->assertDatabaseHas('tenant_user', [
            'tenant_id' => $this->tenant->id,
            'user_id' => $newMember->id,
            'status' => 'active',
        ]);
    }

    public function test_owner_can_update_household_name(): void
    {
        $response = $this->withHeaders(['X-Tenant-ID' => $this->tenant->id])
            ->putJson('/api/v1/household', [
                'name' => 'Gulberg Residence',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Gulberg Residence');

        $this->assertDatabaseHas('tenants', [
            'id' => $this->tenant->id,
            'name' => 'Gulberg Residence',
        ]);
    }

    public function test_can_redeem_promo_code_to_activate_plan(): void
    {
        $response = $this->withHeaders(['X-Tenant-ID' => $this->tenant->id])
            ->postJson('/api/v1/household/redeem-code', [
                'code' => 'LAUNCH2026',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.plan', 'plus')
            ->assertJsonPath('data.promo', '1 Year Plus Family');

        $this->assertDatabaseHas('tenants', [
            'id' => $this->tenant->id,
            'plan' => 'plus',
        ]);
    }

    public function test_invalid_promo_code_fails(): void
    {
        $response = $this->withHeaders(['X-Tenant-ID' => $this->tenant->id])
            ->postJson('/api/v1/household/redeem-code', [
                'code' => 'INVALID_CODE',
            ]);

        $response->assertStatus(422);
    }
}