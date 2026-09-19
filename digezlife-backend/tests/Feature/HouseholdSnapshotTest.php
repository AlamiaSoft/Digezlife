<?php

namespace Tests\Feature;

use Alamia\Core\Tenant\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Modules\Grocery\Models\GroceryList;
use Modules\Reminders\Models\Reminder;
use Tests\TestCase;

class HouseholdSnapshotTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'id' => 'household-snap',
            'name' => 'Snapshot Household',
            'status' => 'active',
        ]);

        $this->user = User::factory()->create(['name' => 'Snapshot User']);
        $this->user->tenants()->attach($this->tenant->id, [
            'is_owner' => true,
            'status' => 'active',
        ]);

        Sanctum::actingAs($this->user, ['*']);
    }

    public function test_household_snapshot_financial_consistency_lifecycle(): void
    {
        // 1. Initial State: Income = 150,000, Expenses = 30,000, Balance = 120,000
        $this->postJson("/{$this->tenant->id}/api/v1/hisab/transactions", [
            'type' => 'income',
            'amount' => 150000,
            'category' => 'Salary',
            'transaction_date' => now()->format('Y-m-d'),
        ])->assertStatus(201);

        $this->postJson("/{$this->tenant->id}/api/v1/hisab/transactions", [
            'type' => 'expense',
            'amount' => 30000,
            'category' => 'Rent',
            'transaction_date' => now()->format('Y-m-d'),
        ])->assertStatus(201);

        // Fetch snapshot
        $snap1 = $this->withHeader('X-Tenant-ID', $this->tenant->id)
            ->getJson('/api/v1/household/snapshot')
            ->assertStatus(200)
            ->assertJsonPath('data.summary.income', 150000)
            ->assertJsonPath('data.summary.expenses', 30000)
            ->assertJsonPath('data.summary.balance', 120000)
            ->assertJsonPath('data.summary.status', 'surplus');

        $revision1 = $snap1->json('data.revision');
        $this->assertNotEmpty($revision1);

        // 2. Create large expense: 125,000 -> Expected: Expenses = 155,000, Balance = -5,000 (Deficit)
        $txRes = $this->postJson("/{$this->tenant->id}/api/v1/hisab/transactions", [
            'type' => 'expense',
            'amount' => 125000,
            'category' => 'Appliances',
            'transaction_date' => now()->format('Y-m-d'),
        ])->assertStatus(201);

        $expenseId = $txRes->json('data.id');

        $snap2 = $this->withHeader('X-Tenant-ID', $this->tenant->id)
            ->getJson('/api/v1/household/snapshot')
            ->assertStatus(200)
            ->assertJsonPath('data.summary.income', 150000)
            ->assertJsonPath('data.summary.expenses', 155000)
            ->assertJsonPath('data.summary.balance', -5000)
            ->assertJsonPath('data.summary.status', 'deficit');

        $revision2 = $snap2->json('data.revision');
        $this->assertNotEquals($revision1, $revision2);

        // 3. Delete 125,000 expense -> Authoritative recovery: Expenses = 30,000, Balance = 120,000 (Surplus)
        $this->deleteJson("/{$this->tenant->id}/api/v1/hisab/transactions/{$expenseId}")
            ->assertStatus(200);

        $snap3 = $this->withHeader('X-Tenant-ID', $this->tenant->id)
            ->getJson('/api/v1/household/snapshot')
            ->assertStatus(200)
            ->assertJsonPath('data.summary.income', 150000)
            ->assertJsonPath('data.summary.expenses', 30000)
            ->assertJsonPath('data.summary.balance', 120000)
            ->assertJsonPath('data.summary.status', 'surplus');

        // 4. Test conditional 304 Not Modified with revision
        $revision3 = $snap3->json('data.revision');
        $this->withHeader('X-Tenant-ID', $this->tenant->id)
            ->withHeader('If-None-Match', $revision3)
            ->getJson('/api/v1/household/snapshot')
            ->assertStatus(304);
    }

    public function test_household_snapshot_aggregates_grocery_and_reminders(): void
    {
        // Create a grocery list and item
        $list = GroceryList::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Weekly Essentials',
            'is_archived' => false,
        ]);

        $list->items()->create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Organic Milk',
            'quantity' => 2,
            'unit' => 'liters',
            'category' => 'Dairy',
            'is_checked' => false,
        ]);

        // Create a reminder
        Reminder::create([
            'tenant_id' => $this->tenant->id,
            'title' => 'Internet Bill',
            'category' => 'Bill',
            'due_at' => now()->addDays(2),
            'is_completed' => false,
        ]);

        $response = $this->withHeader('X-Tenant-ID', $this->tenant->id)
            ->getJson('/api/v1/household/snapshot')
            ->assertStatus(200);

        $response->assertJsonPath('data.grocery.total_count', 1)
            ->assertJsonPath('data.grocery.pending_count', 1)
            ->assertJsonPath('data.grocery.items.0.name', 'Organic Milk')
            ->assertJsonPath('data.reminders.pending_count', 1)
            ->assertJsonPath('data.reminders.active.0.title', 'Internet Bill');
    }
}
