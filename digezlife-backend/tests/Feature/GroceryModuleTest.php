<?php

namespace Tests\Feature;

use Alamia\Core\Tenant\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Modules\Grocery\Models\GroceryList;
use Tests\TestCase;

class GroceryModuleTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'id' => 'household-test',
            'name' => 'Test Household',
            'status' => 'active',
        ]);

        $this->user = User::factory()->create();
        $this->user->tenants()->attach($this->tenant->id, ['role' => 'owner']);

        Sanctum::actingAs($this->user, ['*']);
    }

    public function test_can_create_and_list_grocery_lists(): void
    {
        $response = $this->postJson("/{$this->tenant->id}/api/v1/grocery/lists", [
            'name' => 'Weekly Groceries',
            'icon' => 'shopping-cart',
            'color' => 'teal',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Weekly Groceries');

        $listResponse = $this->getJson("/{$this->tenant->id}/api/v1/grocery/lists");
        $listResponse->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_can_add_item_and_toggle_checked_state(): void
    {
        $list = GroceryList::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Pantry Restock',
        ]);

        $itemResponse = $this->postJson("/{$this->tenant->id}/api/v1/grocery/lists/{$list->external_id}/items", [
            'name' => 'Milk Pack',
            'quantity' => 2,
            'unit' => 'liters',
            'category' => 'Dairy',
        ]);

        $itemResponse->assertStatus(201)
            ->assertJsonPath('data.name', 'Milk Pack')
            ->assertJsonPath('data.is_checked', false);

        $itemId = $itemResponse->json('data.external_id');

        $toggleResponse = $this->patchJson("/{$this->tenant->id}/api/v1/grocery/lists/{$list->external_id}/items/{$itemId}/toggle");
        $toggleResponse->assertStatus(200)
            ->assertJsonPath('data.is_checked', true);
    }

    public function test_can_export_whatsapp_formatted_text(): void
    {
        $list = GroceryList::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Weekend BBQ',
        ]);

        $list->items()->create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Chicken Breast',
            'quantity' => 2,
            'unit' => 'kg',
            'is_checked' => false,
        ]);

        $response = $this->getJson("/{$this->tenant->id}/api/v1/grocery/lists/{$list->external_id}/whatsapp");

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['formatted_text', 'whatsapp_url']]);

        $this->assertStringContainsString('Weekend BBQ', $response->json('data.formatted_text'));
        $this->assertStringContainsString('Chicken Breast (2 kg)', $response->json('data.formatted_text'));
    }
}
