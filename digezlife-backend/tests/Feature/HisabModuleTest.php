<?php

namespace Tests\Feature;

use Alamia\Core\Tenant\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class HisabModuleTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'id' => 'household-hisab',
            'name' => 'Hisab Household',
            'status' => 'active',
        ]);

        $this->user = User::factory()->create();
        $this->user->tenants()->attach($this->tenant->id, ['role' => 'owner']);

        Sanctum::actingAs($this->user, ['*']);
    }

    public function test_can_record_transaction_and_calculate_summary(): void
    {
        // Record Income
        $this->postJson("/{$this->tenant->id}/api/v1/hisab/transactions", [
            'type' => 'income',
            'amount' => 150000,
            'category' => 'Salary',
            'transaction_date' => now()->format('Y-m-d'),
        ])->assertStatus(201);

        // Record Expense
        $this->postJson("/{$this->tenant->id}/api/v1/hisab/transactions", [
            'type' => 'expense',
            'amount' => 45000,
            'category' => 'Rent',
            'transaction_date' => now()->format('Y-m-d'),
        ])->assertStatus(201);

        // Verify summary
        $summaryResponse = $this->getJson("/{$this->tenant->id}/api/v1/hisab/summary?month=".now()->format('Y-m'));

        $summaryResponse->assertStatus(200)
            ->assertJsonPath('data.total_income', 150000)
            ->assertJsonPath('data.total_expense', 45000)
            ->assertJsonPath('data.net_savings', 105000);
    }

    public function test_can_record_debt_and_settle_payment(): void
    {
        $debtResponse = $this->postJson("/{$this->tenant->id}/api/v1/hisab/debts", [
            'direction' => 'lent',
            'person_name' => 'Tariq Mehmood',
            'person_phone' => '03001234567',
            'amount' => 10000,
            'due_date' => now()->addDays(14)->format('Y-m-d'),
        ]);

        $debtResponse->assertStatus(201)
            ->assertJsonPath('data.person_name', 'Tariq Mehmood');

        $debtId = $debtResponse->json('data.external_id');

        // Settle partial payment
        $settleResponse = $this->postJson("/{$this->tenant->id}/api/v1/hisab/debts/{$debtId}/settle", [
            'amount_paid' => 4000,
        ]);

        $settleResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'partial')
            ->assertJsonPath('data.paid_amount', 4000)
            ->assertJsonPath('data.remaining_amount', 6000);

        // WhatsApp reminder test
        $waResponse = $this->getJson("/{$this->tenant->id}/api/v1/hisab/debts/{$debtId}/whatsapp");
        $waResponse->assertStatus(200)
            ->assertJsonStructure(['data' => ['formatted_text', 'whatsapp_url']]);
    }

    public function test_can_generate_financial_report(): void
    {
        // Add sample income
        $this->postJson("/{$this->tenant->id}/api/v1/hisab/transactions", [
            'type' => 'income',
            'amount' => 200000,
            'category' => 'Salary',
            'transaction_date' => now()->format('Y-m-d'),
        ])->assertStatus(201);

        // Add sample expenses across different categories
        $this->postJson("/{$this->tenant->id}/api/v1/hisab/transactions", [
            'type' => 'expense',
            'amount' => 50000,
            'category' => 'Rent',
            'transaction_date' => now()->format('Y-m-d'),
        ])->assertStatus(201);

        $this->postJson("/{$this->tenant->id}/api/v1/hisab/transactions", [
            'type' => 'expense',
            'amount' => 25000,
            'category' => 'Groceries',
            'transaction_date' => now()->format('Y-m-d'),
        ])->assertStatus(201);

        // Generate report for this month
        $reportResponse = $this->getJson("/{$this->tenant->id}/api/v1/hisab/report?period=this_month");

        $reportResponse->assertStatus(200)
            ->assertJsonPath('data.summary.total_income', 200000)
            ->assertJsonPath('data.summary.total_expense', 75000)
            ->assertJsonPath('data.summary.net_savings', 125000)
            ->assertJsonPath('data.summary.savings_rate', 63)
            ->assertJsonStructure([
                'data' => [
                    'period' => ['key', 'label', 'from', 'to'],
                    'summary' => ['total_income', 'income_count', 'total_expense', 'expense_count', 'net_savings', 'savings_rate', 'daily_average'],
                    'categories',
                    'members',
                    'monthly_trend',
                    'transactions',
                ]
            ]);

        // Verify member attribution exists
        $this->assertNotEmpty($reportResponse->json('data.members'));
        $this->assertEquals($this->user->name, $reportResponse->json('data.members.0.name'));
    }
}
