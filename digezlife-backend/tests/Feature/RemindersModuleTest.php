<?php

namespace Tests\Feature;

use Alamia\Core\Tenant\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RemindersModuleTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'id' => 'household-reminders',
            'name' => 'Reminders Household',
            'status' => 'active',
        ]);

        $this->user = User::factory()->create();
        $this->user->tenants()->attach($this->tenant->id, ['role' => 'owner']);

        Sanctum::actingAs($this->user, ['*']);
    }

    public function test_can_schedule_and_toggle_reminder(): void
    {
        $response = $this->postJson("/{$this->tenant->id}/api/v1/reminders", [
            'title' => 'Electricity Bill Payment',
            'description' => 'Pay via Easypaisa consumer number 12345678',
            'category' => 'Bill',
            'due_at' => now()->addDays(5)->toDateTimeString(),
            'recurrence_rule' => 'monthly',
            'notification_channels' => ['push', 'whatsapp'],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Electricity Bill Payment')
            ->assertJsonPath('data.is_completed', false);

        $reminderId = $response->json('data.external_id');

        // Toggle completed
        $toggleResponse = $this->patchJson("/{$this->tenant->id}/api/v1/reminders/{$reminderId}/toggle");
        $toggleResponse->assertStatus(200)
            ->assertJsonPath('data.is_completed', true);

        // List reminders
        $listResponse = $this->getJson("/{$this->tenant->id}/api/v1/reminders");
        $listResponse->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }
}
