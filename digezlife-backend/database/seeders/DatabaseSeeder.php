<?php

namespace Database\Seeders;

use Alamia\Core\Tenant\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Modules\Grocery\Models\GroceryItem;
use Modules\Grocery\Models\GroceryList;
use Modules\Hisab\Models\HisabDebt;
use Modules\Hisab\Models\HisabTransaction;
use Modules\Reminders\Models\Reminder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with demo data.
     */
    public function run(): void
    {
        // 0. Seed or Update Default SuperAdmin from Environment
        $superAdminEmail = env('SUPERADMIN_EMAIL', 'admin@gharlyapp.com');
        $superAdminPassword = env('SUPERADMIN_PASSWORD');
        $superAdminName = env('SUPERADMIN_NAME', 'System Admin');

        if (! empty($superAdminPassword)) {
            if (class_exists(\Alamia\Core\Authorization\Models\SuperAdmin::class)) {
                \Alamia\Core\Authorization\Models\SuperAdmin::updateOrCreate(
                    ['email' => $superAdminEmail],
                    [
                        'name' => $superAdminName,
                        'password' => Hash::make($superAdminPassword),
                        'status' => 'active',
                        'email_verified_at' => now(),
                    ]
                );
            }

            User::updateOrCreate(
                ['email' => $superAdminEmail],
                [
                    'name' => $superAdminName,
                    'password' => Hash::make($superAdminPassword),
                    'email_verified_at' => now(),
                ]
            );
        }

        // 1. Create Demo Household Tenant
        $tenant = Tenant::firstOrCreate(
            ['id' => 'demo-household'],
            [
                'name' => 'My Household',
                'status' => 'active',
            ]
        );

        // 2. Create Demo Users (GharlyApp & DigEzLife)
        $demoEmails = ['demo@gharlyapp.com', 'demo@digezlife.com'];
        $demoPassword = env('DEMO_USER_PASSWORD', 'demo-user-key-token');
        foreach ($demoEmails as $email) {
            $u = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => 'Demo User',
                    'password' => Hash::make($demoPassword),
                    'email_verified_at' => now(),
                ]
            );
            if (! $u->tenants()->where('tenants.id', $tenant->id)->exists()) {
                $u->tenants()->attach($tenant->id, ['role' => 'admin']);
            }
        }
        $user = User::where('email', 'demo@gharlyapp.com')->first();

        // 4. Seed Demo Grocery Lists and Items
        $groceryList = GroceryList::firstOrCreate(
            [
                'tenant_id' => $tenant->id,
                'name' => 'Weekly Kitchen Rashan',
            ],
            [
                'icon' => 'cart',
                'color' => '#0d6b68',
                'is_archived' => false,
            ]
        );

        $sampleItems = [
            ['name' => 'Fresh Milk (Olpers/Dairy)', 'quantity' => 2, 'unit' => 'liters', 'category' => 'Dairy', 'is_checked' => false],
            ['name' => 'Basmati Rice', 'quantity' => 5, 'unit' => 'kg', 'category' => 'Grains', 'is_checked' => false],
            ['name' => 'Chakki Atta', 'quantity' => 10, 'unit' => 'kg', 'category' => 'Flour', 'is_checked' => true],
            ['name' => 'Cooking Oil (Dalda)', 'quantity' => 5, 'unit' => 'liters', 'category' => 'Pantry', 'is_checked' => false],
            ['name' => 'Tapal Danedar Tea', 'quantity' => 400, 'unit' => 'grams', 'category' => 'Beverages', 'is_checked' => true],
            ['name' => 'Eggs (Dozen)', 'quantity' => 2, 'unit' => 'dozen', 'category' => 'Dairy', 'is_checked' => false],
        ];

        foreach ($sampleItems as $index => $item) {
            GroceryItem::firstOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'grocery_list_id' => $groceryList->id,
                    'name' => $item['name'],
                ],
                [
                    'quantity' => $item['quantity'],
                    'unit' => $item['unit'],
                    'category' => $item['category'],
                    'is_checked' => $item['is_checked'],
                    'checked_at' => $item['is_checked'] ? now() : null,
                    'is_recurring' => true,
                    'sort_order' => $index + 1,
                ]
            );
        }

        // 5. Seed Demo Hisab Transactions
        $sampleTransactions = [
            ['type' => 'income', 'amount' => 120000, 'category' => 'Salary', 'payment_method' => 'Bank Transfer', 'notes' => 'Monthly Salary Deposit', 'transaction_date' => now()->startOfMonth()->toDateString()],
            ['type' => 'expense', 'amount' => 4500, 'category' => 'Groceries', 'payment_method' => 'Cash', 'notes' => 'Weekly vegetable & fruit market', 'transaction_date' => now()->subDays(3)->toDateString()],
            ['type' => 'expense', 'amount' => 12500, 'category' => 'Utilities', 'payment_method' => 'Easypaisa', 'notes' => 'K-Electric Bill Payment', 'transaction_date' => now()->subDays(2)->toDateString()],
            ['type' => 'expense', 'amount' => 3200, 'category' => 'Fuel', 'payment_method' => 'Card', 'notes' => 'PSO Petrol pump fill-up', 'transaction_date' => now()->subDays(1)->toDateString()],
            ['type' => 'expense', 'amount' => 1500, 'category' => 'Dining', 'payment_method' => 'Cash', 'notes' => 'Chai & Snacks with friends', 'transaction_date' => now()->toDateString()],
        ];

        foreach ($sampleTransactions as $txn) {
            HisabTransaction::firstOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'notes' => $txn['notes'],
                    'transaction_date' => $txn['transaction_date'],
                ],
                [
                    'type' => $txn['type'],
                    'amount' => $txn['amount'],
                    'currency' => 'PKR',
                    'category' => $txn['category'],
                    'payment_method' => $txn['payment_method'],
                    'created_by' => $user->id,
                ]
            );
        }

        // 6. Seed Demo Udhaar / Debts
        $sampleDebts = [
            [
                'direction' => 'borrowed',
                'person_name' => 'Ahmed Grocery Store',
                'person_phone' => '03001234567',
                'amount' => 2500,
                'paid_amount' => 1000,
                'due_date' => now()->addDays(5)->toDateString(),
                'status' => 'partial',
                'notes' => 'Monthly grocery shop tab',
            ],
            [
                'direction' => 'lent',
                'person_name' => 'Tariq Brother',
                'person_phone' => '03129876543',
                'amount' => 5000,
                'paid_amount' => 0,
                'due_date' => now()->addDays(10)->toDateString(),
                'status' => 'pending',
                'notes' => 'Emergency loan for bike repair',
            ],
        ];

        foreach ($sampleDebts as $debt) {
            HisabDebt::firstOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'person_name' => $debt['person_name'],
                    'direction' => $debt['direction'],
                ],
                [
                    'person_phone' => $debt['person_phone'],
                    'amount' => $debt['amount'],
                    'paid_amount' => $debt['paid_amount'],
                    'due_date' => $debt['due_date'],
                    'status' => $debt['status'],
                    'notes' => $debt['notes'],
                ]
            );
        }

        // 7. Seed Demo Reminders
        $sampleReminders = [
            [
                'title' => 'Pay K-Electric Electricity Bill',
                'description' => 'Consumer number 040001234567 on Easypaisa before late fee',
                'category' => 'Bill',
                'due_at' => now()->addDays(3)->setTime(18, 0),
                'recurrence_rule' => 'monthly',
                'is_completed' => false,
            ],
            [
                'title' => 'Car Oil and Filter Change',
                'description' => 'Target 5000 km service at Toyota center',
                'category' => 'Maintenance',
                'due_at' => now()->addDays(7)->setTime(11, 0),
                'recurrence_rule' => 'none',
                'is_completed' => false,
            ],
            [
                'title' => 'Medicine Refill (Panadol & Multivitamins)',
                'description' => 'Monthly pharmacy restock from D.Watson',
                'category' => 'Health',
                'due_at' => now()->subDay()->setTime(14, 0),
                'recurrence_rule' => 'monthly',
                'is_completed' => true,
            ],
        ];

        foreach ($sampleReminders as $reminder) {
            Reminder::firstOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'title' => $reminder['title'],
                ],
                [
                    'description' => $reminder['description'],
                    'category' => $reminder['category'],
                    'due_at' => $reminder['due_at'],
                    'recurrence_rule' => $reminder['recurrence_rule'],
                    'is_completed' => $reminder['is_completed'],
                    'completed_at' => $reminder['is_completed'] ? now() : null,
                    'notification_channels' => ['push'],
                ]
            );
        }
    }
}
