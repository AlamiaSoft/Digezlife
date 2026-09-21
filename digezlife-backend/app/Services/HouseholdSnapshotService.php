<?php

declare(strict_types=1);

namespace App\Services;

use Alamia\Core\Tenant\Models\Tenant;
use App\Models\MemberActivityLog;
use App\Models\TenantMembership;
use App\Models\User;
use Illuminate\Support\Carbon;
use Modules\Grocery\Models\GroceryItem;
use Modules\Grocery\Models\GroceryList;
use Modules\Hisab\Models\HisabDebt;
use Modules\Hisab\Models\HisabTransaction;
use Modules\Reminders\Models\Reminder;

class HouseholdSnapshotService
{
    /**
     * Build an authoritative snapshot for a household tenant and user.
     */
    public function getSnapshot(Tenant $tenant, User $user, ?string $month = null): array
    {
        $targetMonth = $month ?: now()->format('Y-m');

        // 1. Membership & Permissions
        $membership = TenantMembership::where('tenant_id', $tenant->id)
            ->where('user_id', $user->id)
            ->first();

        // 2. Authoritative Financial Summary (Current Month)
        $financialSummary = $this->calculateFinancialSummary($tenant, $targetMonth);

        // 3. Transactions & Debts
        $transactions = HisabTransaction::where('tenant_id', $tenant->id)
            ->with('creator:id,name,email')
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->limit(30)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'type' => $t->type,
                    'amount' => (float) $t->amount,
                    'category' => $t->category ?: 'General',
                    'payment_method' => $t->payment_method ?: 'Cash',
                    'destination_payment_method' => $t->destination_payment_method,
                    'notes' => $t->notes ?: '',
                    'transaction_date' => $t->transaction_date ? Carbon::parse($t->transaction_date)->format('Y-m-d') : null,
                    'created_by' => $t->created_by,
                    'creator_name' => $t->creator?->name ?: 'Household Member',
                    'created_at' => $t->created_at?->toIso8601String(),
                ];
            });

        $debts = HisabDebt::where('tenant_id', $tenant->id)
            ->where('status', '!=', 'settled')
            ->orderBy('due_date', 'asc')
            ->get()
            ->map(function ($d) {
                return [
                    'id' => $d->id,
                    'direction' => $d->direction,
                    'person_name' => $d->person_name,
                    'person_phone' => $d->person_phone,
                    'amount' => (float) $d->amount,
                    'paid_amount' => (float) $d->paid_amount,
                    'remaining_amount' => (float) ($d->amount - $d->paid_amount),
                    'due_date' => $d->due_date ? Carbon::parse($d->due_date)->format('Y-m-d') : null,
                    'notes' => $d->notes,
                    'status' => $d->status,
                ];
            });

        // 4. Grocery Lists & Active Items
        $groceryLists = GroceryList::where('tenant_id', $tenant->id)
            ->where('is_archived', false)
            ->with(['items' => function ($q) {
                $q->with('creator:id,name')->orderBy('is_checked')->orderBy('id', 'desc');
            }])
            ->get();

        if ($groceryLists->isEmpty()) {
            $defaultList = GroceryList::create([
                'tenant_id' => $tenant->id,
                'name' => 'Weekly Essentials',
                'icon' => 'cart-shopping',
                'color' => '#16a34a',
                'is_archived' => false,
            ]);
            $groceryLists = collect([$defaultList->load('items')]);
        }

        $primaryList = $groceryLists->first();
        $primaryItems = $primaryList ? $primaryList->items->map(function ($item) {
            return [
                'id' => $item->id,
                'list_id' => $item->grocery_list_id,
                'name' => $item->name,
                'quantity' => (float) $item->quantity,
                'unit' => $item->unit ?: 'pcs',
                'category' => $item->category ?: 'Pantry',
                'is_checked' => (bool) $item->is_checked,
                'created_by' => $item->created_by,
                'creator_name' => $item->creator?->name ?: 'Household Member',
                'updated_at' => $item->updated_at?->toIso8601String(),
            ];
        }) : collect();

        $totalGroceryItems = $primaryItems->count();
        $checkedGroceryItems = $primaryItems->where('is_checked', true)->count();
        $pendingGroceryItems = $totalGroceryItems - $checkedGroceryItems;

        // 5. Reminders & Alerts
        $activeReminders = Reminder::where('tenant_id', $tenant->id)
            ->where('is_completed', false)
            ->orderBy('due_at', 'asc')
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'title' => $r->title,
                    'category' => $r->category ?: 'General',
                    'due_at' => $r->due_at?->toIso8601String(),
                    'due_date' => $r->due_at ? Carbon::parse($r->due_at)->format('Y-m-d') : null,
                    'recurrence' => $r->recurrence_rule ?: 'none',
                    'is_completed' => false,
                ];
            });

        $completedReminders = Reminder::where('tenant_id', $tenant->id)
            ->where('is_completed', true)
            ->orderBy('completed_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'title' => $r->title,
                    'category' => $r->category ?: 'General',
                    'due_date' => $r->due_at ? Carbon::parse($r->due_at)->format('Y-m-d') : null,
                    'completed_at' => $r->completed_at?->toIso8601String(),
                    'recurrence' => $r->recurrence_rule ?: 'none',
                    'is_completed' => true,
                ];
            });

        // 6. Feed Settings
        $feedSettings = [
            'tenant_cleared_at' => $tenant->activity_feed_cleared_at?->toIso8601String(),
            'personal_cleared_at' => $membership?->activity_feed_cleared_at?->toIso8601String(),
            'dismissed_activities' => is_array($membership?->dismissed_activities)
                ? $membership->dismissed_activities
                : (json_decode($membership?->dismissed_activities ?? '[]', true) ?: []),
            'is_owner' => (bool) $membership?->is_owner,
        ];

        // 7. Recent Pre-Filtered Activity Feed
        $activityFeed = $this->buildActivityFeed($tenant, $feedSettings, $transactions, $primaryItems, $activeReminders);

        // 8. Revision Computation
        $latestTx = HisabTransaction::where('tenant_id', $tenant->id)->latest('id')->first();
        $txCount = HisabTransaction::where('tenant_id', $tenant->id)->count();
        $txSum = (float) HisabTransaction::where('tenant_id', $tenant->id)->sum('amount');

        $latestGrocery = GroceryItem::where('tenant_id', $tenant->id)->latest('id')->first();
        $groceryCount = GroceryItem::where('tenant_id', $tenant->id)->count();

        $latestReminder = Reminder::where('tenant_id', $tenant->id)->latest('id')->first();
        $reminderCount = Reminder::where('tenant_id', $tenant->id)->count();

        $revisionFingerprint = implode('|', [
            $tenant->id,
            $latestTx?->id ?? 0,
            $latestTx?->updated_at?->timestamp ?? 0,
            $txCount,
            $txSum,
            $latestGrocery?->id ?? 0,
            $groceryCount,
            $latestReminder?->id ?? 0,
            $reminderCount,
            $tenant->activity_feed_cleared_at?->timestamp ?? 0,
            $membership?->activity_feed_cleared_at?->timestamp ?? 0,
            count($feedSettings['dismissed_activities']),
        ]);

        $revision = md5($revisionFingerprint);

        return [
            'household' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'currency' => 'PKR',
                'plan' => $tenant->plan ?: 'free',
                'subscription_ends_at' => $tenant->subscription_ends_at?->toIso8601String(),
                'max_seats' => $tenant->max_seats ?? 5,
                'is_owner' => (bool) $membership?->is_owner,
            ],
            'summary' => $financialSummary,
            'wallets' => $financialSummary['wallets'] ?? [],
            'transactions' => $transactions->values()->all(),
            'debts' => $debts->values()->all(),
            'grocery' => [
                'primary_list_id' => $primaryList?->id,
                'primary_list_name' => $primaryList?->name ?: 'Weekly Essentials',
                'items' => $primaryItems->values()->all(),
                'total_count' => $totalGroceryItems,
                'checked_count' => $checkedGroceryItems,
                'pending_count' => $pendingGroceryItems,
                'lists' => $groceryLists->map(function ($l) {
                    return [
                        'id' => $l->id,
                        'name' => $l->name,
                        'icon' => $l->icon ?: 'cart-shopping',
                        'color' => $l->color ?: '#16a34a',
                        'items_count' => $l->items->count(),
                        'pending_count' => $l->items->where('is_checked', false)->count(),
                    ];
                })->values()->all(),
            ],
            'reminders' => [
                'active' => $activeReminders->values()->all(),
                'completed' => $completedReminders->values()->all(),
                'pending_count' => $activeReminders->count(),
                'next_due' => $activeReminders->first()['title'] ?? null,
            ],
            'activity' => $activityFeed,
            'feed_settings' => $feedSettings,
            'revision' => $revision,
            'synced_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Authoritative financial calculations for a month.
     */
    public function calculateFinancialSummary(Tenant $tenant, string $month): array
    {
        $income = (float) HisabTransaction::where('tenant_id', $tenant->id)
            ->where('type', 'income')
            ->where('transaction_date', 'like', "{$month}%")
            ->sum('amount');

        $expenses = (float) HisabTransaction::where('tenant_id', $tenant->id)
            ->where('type', 'expense')
            ->where('transaction_date', 'like', "{$month}%")
            ->sum('amount');

        $balance = $income - $expenses;

        if ($income === 0.0 && $expenses === 0.0) {
            $status = 'balanced';
            $pace = 'No Activity';
            $insight = 'No income or expenses recorded yet this month.';
        } elseif ($balance >= 0) {
            $status = 'surplus';
            $pace = 'Good Pace';
            $rate = $income > 0 ? round(($balance / $income) * 100) : 100;
            $insight = "Healthy monthly surplus of PKR " . number_format($balance, 0) . " ({$rate}% savings rate).";
        } else {
            $status = 'deficit';
            $pace = 'High Spending';
            $deficit = abs($balance);
            $insight = "Monthly spending exceeds total income by PKR " . number_format($deficit, 0) . ".";
        }

        // Category breakdown
        $byCategory = HisabTransaction::where('tenant_id', $tenant->id)
            ->where('type', 'expense')
            ->where('transaction_date', 'like', "{$month}%")
            ->selectRaw('category, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('category')
            ->orderBy('total', 'desc')
            ->get()
            ->map(function ($c) use ($expenses) {
                $total = (float) $c->total;
                $pct = $expenses > 0 ? round(($total / $expenses) * 100) : 0;
                return [
                    'category' => $c->category ?: 'Other',
                    'total' => $total,
                    'count' => (int) $c->count,
                    'percentage' => $pct,
                ];
            });

        // Weekly pace
        $txList = HisabTransaction::where('tenant_id', $tenant->id)
            ->where('type', 'expense')
            ->where('transaction_date', 'like', "{$month}%")
            ->get();

        $w1 = 0; $w2 = 0; $w3 = 0; $w4 = 0;
        foreach ($txList as $tx) {
            $day = (int) date('j', strtotime((string) $tx->transaction_date));
            $amt = (float) $tx->amount;
            if ($day <= 7) $w1 += $amt;
            elseif ($day <= 14) $w2 += $amt;
            elseif ($day <= 21) $w3 += $amt;
            else $w4 += $amt;
        }

        $maxWeek = max($w1, $w2, $w3, $w4, 1);
        $weeklyPace = [
            ['label' => 'Week 1', 'sub' => '1–7', 'amount' => $w1, 'percentage' => $w1 > 0 ? round(($w1 / $maxWeek) * 100) : 0],
            ['label' => 'Week 2', 'sub' => '8–14', 'amount' => $w2, 'percentage' => $w2 > 0 ? round(($w2 / $maxWeek) * 100) : 0],
            ['label' => 'Week 3', 'sub' => '15–21', 'amount' => $w3, 'percentage' => $w3 > 0 ? round(($w3 / $maxWeek) * 100) : 0],
            ['label' => 'Week 4', 'sub' => '22–31', 'amount' => $w4, 'percentage' => $w4 > 0 ? round(($w4 / $maxWeek) * 100) : 0],
        ];

        // Multi-Wallet Balances (Cumulative Envelope Accounting)
        $allTxs = HisabTransaction::where('tenant_id', $tenant->id)->get();
        $normalizeWallet = function (?string $method): string {
            $m = strtolower(trim((string) $method));
            if (in_array($m, ['bank', 'card', 'meezan', 'hbl', 'alfalah', 'bank account'])) return 'Bank';
            if (in_array($m, ['wallet', 'jazzcash', 'easypaisa', 'raast', 'nayapay', 'sadapay', 'mobile wallet'])) return 'Wallet';
            return 'Cash';
        };

        $walletBalances = ['Cash' => 0.0, 'Bank' => 0.0, 'Wallet' => 0.0];
        foreach ($allTxs as $tx) {
            $amt = (float) $tx->amount;
            if ($tx->type === 'income') {
                $w = $normalizeWallet($tx->payment_method);
                $walletBalances[$w] += $amt;
            } elseif ($tx->type === 'expense') {
                $w = $normalizeWallet($tx->payment_method);
                $walletBalances[$w] -= $amt;
            } elseif ($tx->type === 'transfer') {
                $fromW = $normalizeWallet($tx->payment_method);
                $toW = $normalizeWallet($tx->destination_payment_method);
                $walletBalances[$fromW] -= $amt;
                $walletBalances[$toW] += $amt;
            }
        }

        $wallets = [
            [
                'key' => 'Cash',
                'name' => 'Cash in Hand',
                'icon' => 'money-bill-wave',
                'color' => '#16a34a',
                'balance' => $walletBalances['Cash'],
            ],
            [
                'key' => 'Bank',
                'name' => 'Bank Account',
                'icon' => 'building-columns',
                'color' => '#2563eb',
                'balance' => $walletBalances['Bank'],
            ],
            [
                'key' => 'Wallet',
                'name' => 'Mobile Wallet',
                'icon' => 'mobile-screen-button',
                'color' => '#ea580c',
                'balance' => $walletBalances['Wallet'],
            ],
        ];

        return [
            'month' => $month,
            'income' => $income,
            'expenses' => $expenses,
            'balance' => $balance,
            'status' => $status,
            'pace' => $pace,
            'insight' => $insight,
            'by_category' => $byCategory->values()->all(),
            'weekly_pace' => $weeklyPace,
            'wallets' => $wallets,
        ];
    }

    /**
     * Build unified activity feed applying clearance and dismissals.
     */
    protected function buildActivityFeed(
        Tenant $tenant,
        array $feedSettings,
        $transactions,
        $groceryItems,
        $reminders
    ): array {
        $feed = collect();

        $tClear = $feedSettings['tenant_cleared_at'] ? Carbon::parse($feedSettings['tenant_cleared_at'])->timestamp : 0;
        $pClear = $feedSettings['personal_cleared_at'] ? Carbon::parse($feedSettings['personal_cleared_at'])->timestamp : 0;
        $clearThreshold = max($tClear, $pClear);
        $dismissed = $feedSettings['dismissed_activities'] ?? [];

        // Transactions
        foreach ($transactions as $tx) {
            $actId = 'hisab-' . $tx['id'];
            $time = Carbon::parse($tx['created_at'] ?? $tx['transaction_date'])->timestamp;
            if ($time <= $clearThreshold || in_array($actId, $dismissed, true)) continue;

            $feed->push([
                'id' => $actId,
                'entity_type' => 'transaction',
                'entity_id' => $tx['id'],
                'type' => $tx['type'],
                'title' => $tx['notes'] ?: $tx['category'],
                'amount' => $tx['amount'],
                'category' => $tx['category'],
                'actor_name' => $tx['creator_name'],
                'time_text' => Carbon::parse($tx['created_at'] ?? $tx['transaction_date'])->diffForHumans(),
                'timestamp' => $time,
            ]);
        }

        // Grocery Items
        foreach ($groceryItems as $item) {
            $actId = 'grocery-' . $item['id'];
            $time = Carbon::parse($item['updated_at'] ?? now())->timestamp;
            if ($time <= $clearThreshold || in_array($actId, $dismissed, true)) continue;

            $feed->push([
                'id' => $actId,
                'entity_type' => 'grocery',
                'entity_id' => $item['id'],
                'type' => $item['is_checked'] ? 'checked' : 'added',
                'title' => $item['name'],
                'quantity' => "{$item['quantity']} {$item['unit']}",
                'category' => $item['category'],
                'actor_name' => $item['creator_name'],
                'time_text' => Carbon::parse($item['updated_at'] ?? now())->diffForHumans(),
                'timestamp' => $time,
            ]);
        }

        // Reminders
        foreach ($reminders as $rem) {
            $actId = 'reminder-' . $rem['id'];
            $time = $rem['due_at'] ? Carbon::parse($rem['due_at'])->timestamp : now()->timestamp;
            if ($time <= $clearThreshold || in_array($actId, $dismissed, true)) continue;

            $feed->push([
                'id' => $actId,
                'entity_type' => 'reminder',
                'entity_id' => $rem['id'],
                'type' => 'reminder',
                'title' => $rem['title'],
                'category' => $rem['category'],
                'actor_name' => 'Household Reminder',
                'time_text' => $rem['due_date'],
                'timestamp' => $time,
            ]);
        }

        return $feed->sortByDesc('timestamp')->take(25)->values()->all();
    }
}
