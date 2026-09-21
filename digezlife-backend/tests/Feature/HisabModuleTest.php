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

    public function test_can_record_account_transfer_and_track_wallet_balances(): void
    {
        // 1. Record Income into Bank
        $this->postJson("/{$this->tenant->id}/api/v1/hisab/transactions", [
            'type' => 'income',
            'amount' => 100000,
            'category' => 'Salary',
            'payment_method' => 'Bank',
            'transaction_date' => now()->format('Y-m-d'),
        ])->assertStatus(201);

        // 2. Validate transfer with same source and destination fails
        $this->postJson("/{$this->tenant->id}/api/v1/hisab/transactions", [
            'type' => 'transfer',
            'amount' => 10000,
            'payment_method' => 'Bank',
            'destination_payment_method' => 'Bank',
            'transaction_date' => now()->format('Y-m-d'),
        ])->assertStatus(422);

        // 3. Record Account-to-Account Transfer: Bank -> Cash
        $transferRes = $this->postJson("/{$this->tenant->id}/api/v1/hisab/transactions", [
            'type' => 'transfer',
            'amount' => 20000,
            'payment_method' => 'Bank',
            'destination_payment_method' => 'Cash',
            'notes' => 'ATM Cash Withdrawal',
            'transaction_date' => now()->format('Y-m-d'),
        ]);

        $transferRes->assertStatus(201)
            ->assertJsonPath('data.type', 'transfer')
            ->assertJsonPath('data.payment_method', 'Bank')
            ->assertJsonPath('data.destination_payment_method', 'Cash');

        // 4. Record Expense from Cash
        $this->postJson("/{$this->tenant->id}/api/v1/hisab/transactions", [
            'type' => 'expense',
            'amount' => 5000,
            'category' => 'Groceries',
            'payment_method' => 'Cash',
            'transaction_date' => now()->format('Y-m-d'),
        ])->assertStatus(201);

        // 5. Verify hisab summary: transfers are cashflow-neutral (net = 100k - 5k = 95k)
        $summaryRes = $this->getJson("/{$this->tenant->id}/api/v1/hisab/summary?month=".now()->format('Y-m'));
        $summaryRes->assertStatus(200)
            ->assertJsonPath('data.total_income', 100000)
            ->assertJsonPath('data.total_expense', 5000)
            ->assertJsonPath('data.net_savings', 95000);

        $wallets = collect($summaryRes->json('data.wallets'))->keyBy('key');
        $this->assertEquals(15000, $wallets['Cash']['balance']);
        $this->assertEquals(80000, $wallets['Bank']['balance']);
        $this->assertEquals(0, $wallets['Wallet']['balance']);

        // 6. Verify household snapshot includes wallet balances and transfer transaction
        $snapshotRes = $this->withHeaders(['X-Tenant' => $this->tenant->id])
            ->getJson('/api/v1/household/snapshot');
        $snapshotRes->assertStatus(200);

        $snapshotWallets = collect($snapshotRes->json('data.wallets'))->keyBy('key');
        $this->assertEquals(15000, $snapshotWallets['Cash']['balance']);
        $this->assertEquals(80000, $snapshotWallets['Bank']['balance']);

        // Total of all wallet balances MUST equal net household balance
        $totalWalletBalance = $snapshotWallets->sum('balance');
        $this->assertEquals(95000, $totalWalletBalance);
    }

    public function test_can_create_savings_goal_and_deposit(): void
    {
        // 1. Create a savings target
        $createRes = $this->postJson("/{$this->tenant->id}/api/v1/hisab/savings-goals", [
            'name' => 'Emergency Fund',
            'category' => 'Emergency',
            'target_amount' => 100000,
            'current_amount' => 10000,
            'target_date' => now()->addMonths(6)->format('Y-m-d'),
            'notes' => '6 months basic family expenses',
        ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('data.name', 'Emergency Fund')
            ->assertJsonPath('data.target_amount', 100000)
            ->assertJsonPath('data.current_amount', 10000)
            ->assertJsonPath('data.progress_percentage', 10)
            ->assertJsonPath('data.status', 'active');

        $goalId = $createRes->json('data.id');

        // 2. Add deposit to savings target
        $depositRes = $this->postJson("/{$this->tenant->id}/api/v1/hisab/savings-goals/{$goalId}/deposit", [
            'amount' => 40000,
            'payment_method' => 'Bank',
            'notes' => 'Bonus savings deposit',
        ]);

        $depositRes->assertStatus(200)
            ->assertJsonPath('data.goal.current_amount', 50000)
            ->assertJsonPath('data.goal.progress_percentage', 50)
            ->assertJsonPath('data.goal.remaining_amount', 50000);

        // 3. Complete savings target to reach 100%
        $completeRes = $this->postJson("/{$this->tenant->id}/api/v1/hisab/savings-goals/{$goalId}/deposit", [
            'amount' => 50000,
            'payment_method' => 'Cash',
            'notes' => 'Final target completion',
        ]);

        $completeRes->assertStatus(200)
            ->assertJsonPath('data.goal.current_amount', 100000)
            ->assertJsonPath('data.goal.progress_percentage', 100)
            ->assertJsonPath('data.goal.status', 'reached');

        // 4. Verify savings goals are exposed in household snapshot
        $snapshotRes = $this->withHeaders(['X-Tenant' => $this->tenant->id])
            ->getJson('/api/v1/household/snapshot');
        $snapshotRes->assertStatus(200);

        $goals = collect($snapshotRes->json('data.savings_goals'));
        $this->assertTrue($goals->contains('name', 'Emergency Fund'));
        $goalItem = $goals->firstWhere('name', 'Emergency Fund');
        $this->assertEquals(100000, $goalItem['current_amount']);
        $this->assertEquals('reached', $goalItem['status']);
    }

    public function test_can_record_family_transfer_without_distorting_expenses(): void
    {
        // 1. Record Income into Bank
        $this->postJson("/{$this->tenant->id}/api/v1/hisab/transactions", [
            'type' => 'income',
            'amount' => 150000,
            'category' => 'Salary',
            'payment_method' => 'Bank',
            'transaction_date' => now()->format('Y-m-d'),
        ])->assertStatus(201);

        // 2. Record Family Transfer: Bank -> Wife (Allowance)
        $famTransferRes = $this->postJson("/{$this->tenant->id}/api/v1/hisab/transactions", [
            'type' => 'transfer',
            'transfer_type' => 'family',
            'amount' => 30000,
            'payment_method' => 'Bank',
            'recipient_name' => 'Wife',
            'category' => 'Monthly Allowance',
            'notes' => 'Monthly household allowance & personal expenses',
            'transaction_date' => now()->format('Y-m-d'),
        ]);

        $famTransferRes->assertStatus(201)
            ->assertJsonPath('data.type', 'transfer')
            ->assertJsonPath('data.transfer_type', 'family')
            ->assertJsonPath('data.recipient_name', 'Wife')
            ->assertJsonPath('data.payment_method', 'Bank');

        // 3. Verify snapshot:
        // - Expenses should NOT be inflated by family transfer (expenses = 0)
        // - Family transfer is tracked in summary
        // - Bank balance is properly decremented (150k - 30k = 120k)
        $snapshotRes = $this->withHeaders(['X-Tenant' => $this->tenant->id])
            ->getJson('/api/v1/household/snapshot');
        $snapshotRes->assertStatus(200)
            ->assertJsonPath('data.summary.income', 150000)
            ->assertJsonPath('data.summary.expenses', 0)
            ->assertJsonPath('data.summary.family_transfers', 30000);

        $wallets = collect($snapshotRes->json('data.wallets'))->keyBy('key');
        $this->assertEquals(120000, $wallets['Bank']['balance']);

        // 4. Verify transaction list in snapshot includes family transfer attributes
        $txList = collect($snapshotRes->json('data.transactions'));
        $transferTx = $txList->firstWhere('transfer_type', 'family');
        $this->assertNotNull($transferTx);
        $this->assertEquals('Wife', $transferTx['recipient_name']);
        $this->assertEquals(30000, $transferTx['amount']);
    }
}

