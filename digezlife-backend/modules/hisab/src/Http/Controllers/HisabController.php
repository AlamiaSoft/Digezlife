<?php

namespace Modules\Hisab\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Modules\Hisab\Models\HisabDebt;
use Modules\Hisab\Models\HisabSavingsContribution;
use Modules\Hisab\Models\HisabSavingsGoal;
use Modules\Hisab\Models\HisabTransaction;

class HisabController extends Controller
{
    /**
     * List transactions with optional date & category filters.
     */
    public function indexTransactions(Request $request): JsonResponse
    {
        $query = HisabTransaction::query();

        if ($month = $request->input('month')) {
            $query->where('transaction_date', 'like', "{$month}%");
        }

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        $transactions = $query->with('creator:id,name,email')
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($request->input('per_page', 25));

        return response()->json($transactions);
    }

    /**
     * Record a new transaction (income/expense).
     */
    public function storeTransaction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense,transfer',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'nullable|string|size:3',
            'category' => 'nullable|string|max:50',
            'payment_method' => 'nullable|string|max:30',
            'destination_payment_method' => 'nullable|string|max:30',
            'transfer_type' => 'nullable|in:wallet,family',
            'recipient_name' => 'nullable|string|max:100',
            'recipient_user_id' => 'nullable|exists:users,id',
            'transaction_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $tenantId = (function_exists('tenant') && tenant('id'))
            ? (string) tenant('id')
            : ($request->route('tenant') ?: $request->header('X-Tenant-ID') ?: ($request->user()?->tenants()->first()?->id) ?: 'demo-household');

        $type = $validated['type'];
        $transferType = $validated['transfer_type'] ?? 'wallet';
        $paymentMethod = $validated['payment_method'] ?? ($type === 'transfer' ? 'Bank' : 'Cash');
        $destMethod = ($type === 'transfer' && $transferType === 'wallet')
            ? ($validated['destination_payment_method'] ?? 'Cash')
            : null;
        $recipientName = $transferType === 'family' ? ($validated['recipient_name'] ?? null) : null;
        $recipientUserId = $transferType === 'family' ? ($validated['recipient_user_id'] ?? null) : null;

        if ($type === 'transfer' && $transferType === 'wallet') {
            if (strtolower(trim((string) $paymentMethod)) === strtolower(trim((string) $destMethod))) {
                return response()->json([
                    'message' => 'The source and destination wallets must be different.',
                    'errors' => [
                        'destination_payment_method' => ['Source and destination wallets must be different.'],
                    ],
                ], 422);
            }
        }

        $category = $validated['category'] ?? ($type === 'transfer' ? ($transferType === 'family' ? 'Family Support' : 'Transfer') : 'General');

        $transaction = HisabTransaction::create([
            'tenant_id' => $tenantId,
            'type' => $type,
            'amount' => $validated['amount'],
            'currency' => $validated['currency'] ?? 'PKR',
            'category' => $category,
            'payment_method' => $paymentMethod,
            'destination_payment_method' => $destMethod,
            'transfer_type' => $type === 'transfer' ? $transferType : null,
            'recipient_name' => $recipientName,
            'recipient_user_id' => $recipientUserId,
            'transaction_date' => $validated['transaction_date'],
            'notes' => $validated['notes'] ?? null,
            'created_by' => $request->user()?->id,
        ]);

        $logName = $type === 'transfer'
            ? ($transferType === 'family'
                ? "Family Transfer: {$paymentMethod} → " . ($recipientName ?: 'Family Member') . ($category ? " ({$category})" : "")
                : "Transfer: {$paymentMethod} → {$destMethod}")
            : ($transaction->notes ?: $transaction->category ?: 'Transaction');

        \App\Models\MemberActivityLog::record($tenantId, auth()->id(), null, 'item_created', [
            'type' => 'hisab',
            'name' => $logName,
            'amount' => (string) $transaction->amount
        ]);

        return response()->json([
            'message' => 'Transaction recorded successfully',
            'data' => $transaction,
        ], 201);
    }

    /**
     * Get monthly cashflow analytics summary.
     */
    public function getSummary(Request $request): JsonResponse
    {
        $month = $request->input('month', now()->format('Y-m'));

        $income = (float) HisabTransaction::where('type', 'income')
            ->where('transaction_date', 'like', "{$month}%")
            ->sum('amount');

        $expense = (float) HisabTransaction::where('type', 'expense')
            ->where('transaction_date', 'like', "{$month}%")
            ->sum('amount');

        $net = $income - $expense;

        $byCategory = HisabTransaction::where('type', 'expense')
            ->where('transaction_date', 'like', "{$month}%")
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->orderBy('total', 'desc')
            ->get();

        $lentTotal = (float) (HisabDebt::where('direction', 'lent')
            ->where('status', '!=', 'settled')
            ->selectRaw('SUM(amount - paid_amount) as total')
            ->value('total') ?? 0);

        $borrowedTotal = (float) (HisabDebt::where('direction', 'borrowed')
            ->where('status', '!=', 'settled')
            ->selectRaw('SUM(amount - paid_amount) as total')
            ->value('total') ?? 0);

        // Calculate weekly expense pace
        $expenses = HisabTransaction::where('type', 'expense')
            ->where('transaction_date', 'like', "{$month}%")
            ->get();

        $w1 = 0; $w2 = 0; $w3 = 0; $w4 = 0;
        foreach ($expenses as $tx) {
            $day = (int) date('j', strtotime($tx->transaction_date));
            $amt = (float) $tx->amount;
            if ($day <= 7) $w1 += $amt;
            elseif ($day <= 14) $w2 += $amt;
            elseif ($day <= 21) $w3 += $amt;
            else $w4 += $amt;
        }

        $maxWeek = max($w1, $w2, $w3, $w4, 1);
        $weeklyPace = [
            ['label' => 'Week 1', 'days' => 'Day 1–7', 'amount' => $w1, 'percentage' => $maxWeek > 0 && $w1 > 0 ? round(($w1 / $maxWeek) * 100) : 0, 'is_peak' => ($w1 === $maxWeek && $w1 > 0)],
            ['label' => 'Week 2', 'days' => 'Day 8–14', 'amount' => $w2, 'percentage' => $maxWeek > 0 && $w2 > 0 ? round(($w2 / $maxWeek) * 100) : 0, 'is_peak' => ($w2 === $maxWeek && $w2 > 0)],
            ['label' => 'Week 3', 'days' => 'Day 15–21', 'amount' => $w3, 'percentage' => $maxWeek > 0 && $w3 > 0 ? round(($w3 / $maxWeek) * 100) : 0, 'is_peak' => ($w3 === $maxWeek && $w3 > 0)],
            ['label' => 'Week 4', 'days' => 'Day 22–31', 'amount' => $w4, 'percentage' => $maxWeek > 0 && $w4 > 0 ? round(($w4 / $maxWeek) * 100) : 0, 'is_peak' => ($w4 === $maxWeek && $w4 > 0)],
        ];

        // Dynamic financial insight string
        $topCat = $byCategory->first();
        if ($income === 0.0 && $expense === 0.0) {
            $insight = 'No transactions recorded yet this month. Tap "+ Record Entry" to log your household income or expenses.';
        } elseif ($net >= 0) {
            $savePct = $income > 0 ? round(($net / $income) * 100) : 100;
            $insight = "Healthy surplus of PKR ".number_format($net, 0)." ({$savePct}% savings rate).";
            if ($topCat) {
                $topCatPct = $expense > 0 ? round(($topCat->total / $expense) * 100) : 0;
                $insight .= " Top expense driver is {$topCat->category} ({$topCatPct}% of total spending).";
            }
        } else {
            $deficit = abs($net);
            $insight = "Monthly spending exceeds income by PKR ".number_format($deficit, 0).".";
            if ($topCat) {
                $topCatPct = $expense > 0 ? round(($topCat->total / $expense) * 100) : 0;
                $insight .= " {$topCat->category} accounts for {$topCatPct}% of total expenditures.";
            }
        }
        if ($lentTotal > 0) {
            $insight .= " You have PKR ".number_format($lentTotal, 0)." in receivables pending settlement.";
        }

        // Cumulative Multi-Wallet Balances
        $allTxs = HisabTransaction::all();
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
                $walletBalances[$fromW] -= $amt;
                if ($tx->transfer_type !== 'family' && !empty($tx->destination_payment_method)) {
                    $toW = $normalizeWallet($tx->destination_payment_method);
                    $walletBalances[$toW] += $amt;
                }
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

        return response()->json([
            'data' => [
                'month' => $month,
                'total_income' => $income,
                'total_expense' => $expense,
                'net_savings' => $net,
                'categories' => $byCategory,
                'weekly_pace' => $weeklyPace,
                'insight' => $insight,
                'total_to_receive' => $lentTotal,
                'total_to_pay' => $borrowedTotal,
                'wallets' => $wallets,
            ],
        ]);
    }

    /**
     * List all debts / Udhaar records.
     */
    public function indexDebts(Request $request): JsonResponse
    {
        $query = HisabDebt::query();

        if ($direction = $request->input('direction')) {
            $query->where('direction', $direction);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $debts = $query->orderBy('status', 'asc')
            ->orderBy('due_date', 'asc')
            ->get()
            ->append('remaining_amount');

        return response()->json([
            'data' => $debts,
        ]);
    }

    /**
     * Create a debt / Udhaar entry.
     */
    public function storeDebt(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'direction' => 'required|in:lent,borrowed',
            'person_name' => 'required|string|max:100',
            'person_phone' => 'nullable|string|max:30',
            'amount' => 'required|numeric|min:1',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $tenantId = (function_exists('tenant') && tenant('id'))
            ? (string) tenant('id')
            : ($request->route('tenant') ?: $request->header('X-Tenant-ID') ?: ($request->user()?->tenants()->first()?->id) ?: 'demo-household');

        $debt = HisabDebt::create([
            ...$validated,
            'tenant_id' => $tenantId,
            'currency' => 'PKR',
            'paid_amount' => 0,
            'status' => 'pending',
            'created_by' => $request->user()?->id,
        ]);

        \App\Models\MemberActivityLog::record($tenantId, auth()->id(), null, 'item_created', [
            'type' => 'debt',
            'name' => $debt->person_name,
            'amount' => (string) $debt->amount
        ]);

        return response()->json([
            'message' => 'Debt record created successfully',
            'data' => $debt,
        ], 201);
    }

    /**
     * Settle or make a partial payment on a debt.
     */
    public function settleDebt(Request $request, string $debtId): JsonResponse
    {
        $debt = HisabDebt::where('external_id', $debtId)
            ->orWhere('id', $debtId)
            ->firstOrFail();

        $validated = $request->validate([
            'amount_paid' => 'required|numeric|min:0.01',
        ]);

        $newPaidAmount = $debt->paid_amount + $validated['amount_paid'];
        $newStatus = ($newPaidAmount >= $debt->amount) ? 'settled' : 'partial';

        $debt->update([
            'paid_amount' => min($newPaidAmount, $debt->amount),
            'status' => $newStatus,
        ]);

        return response()->json([
            'message' => 'Payment recorded successfully',
            'data' => $debt->append('remaining_amount'),
        ]);
    }

    /**
     * Generate a polite WhatsApp reminder message.
     */
    public function debtWhatsAppReminder(string $debtId): JsonResponse
    {
        $debt = HisabDebt::where('external_id', $debtId)
            ->orWhere('id', $debtId)
            ->firstOrFail();

        $remaining = $debt->remaining_amount;

        $text = "Salam {$debt->person_name}, this is a gentle reminder regarding the pending amount of PKR ".number_format($remaining, 0);
        if ($debt->due_date) {
            $text .= " (due on {$debt->due_date->format('d M Y')})";
        }
        $text .= ". Whenever convenient, please arrange the settlement. Thank you!\n- Sent via DigEzLife";

        $phoneParam = preg_replace('/[^0-9]/', '', $debt->person_phone ?? '');
        $waUrl = "https://wa.me/{$phoneParam}?text=".urlencode($text);

        return response()->json([
            'data' => [
                'formatted_text' => $text,
                'whatsapp_url' => $waUrl,
            ],
        ]);
    }

    /**
     * Update an existing transaction.
     */
    public function updateTransaction(Request $request, string $id): JsonResponse
    {
        $transaction = HisabTransaction::where('external_id', $id)
            ->orWhere('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'type' => 'required|in:income,expense,transfer',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'nullable|string|size:3',
            'category' => 'nullable|string|max:50',
            'payment_method' => 'nullable|string|max:30',
            'destination_payment_method' => 'nullable|string|max:30',
            'transfer_type' => 'nullable|in:wallet,family',
            'recipient_name' => 'nullable|string|max:100',
            'recipient_user_id' => 'nullable|integer',
            'transaction_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $type = $validated['type'];
        $transferType = $validated['transfer_type'] ?? $transaction->transfer_type ?? 'wallet';
        $paymentMethod = $validated['payment_method'] ?? $transaction->payment_method ?? ($type === 'transfer' ? 'Bank' : 'Cash');
        $destMethod = ($type === 'transfer' && $transferType === 'wallet')
            ? ($validated['destination_payment_method'] ?? $transaction->destination_payment_method ?? 'Cash')
            : null;
        $recipientName = ($type === 'transfer' && $transferType === 'family')
            ? ($validated['recipient_name'] ?? $transaction->recipient_name)
            : null;
        $recipientUserId = ($type === 'transfer' && $transferType === 'family')
            ? ($validated['recipient_user_id'] ?? $transaction->recipient_user_id)
            : null;

        if ($type === 'transfer' && $transferType === 'wallet') {
            if (strtolower(trim((string) $paymentMethod)) === strtolower(trim((string) $destMethod))) {
                return response()->json([
                    'message' => 'The source and destination wallets must be different.',
                    'errors' => [
                        'destination_payment_method' => ['Source and destination wallets must be different.'],
                    ],
                ], 422);
            }
        }

        $validated['payment_method'] = $paymentMethod;
        $validated['destination_payment_method'] = $destMethod;
        $validated['transfer_type'] = $type === 'transfer' ? $transferType : null;
        $validated['recipient_name'] = $recipientName;
        $validated['recipient_user_id'] = $recipientUserId;
        $validated['category'] = $validated['category'] ?? ($type === 'transfer' ? ($transferType === 'family' ? 'Family Support' : 'Transfer') : ($transaction->category ?: 'General'));

        $transaction->update($validated);

        $logName = $type === 'transfer'
            ? ($transferType === 'family'
                ? "Family Transfer updated: {$paymentMethod} → " . ($recipientName ?: 'Family Member')
                : "Transfer updated: {$paymentMethod} → {$destMethod}")
            : ($transaction->notes ?: ($transaction->category ?: 'Transaction'));

        \App\Models\MemberActivityLog::record($transaction->tenant_id, auth()->id(), null, 'item_updated', [
            'type' => 'hisab',
            'name' => $logName,
            'amount' => (string) $transaction->amount
        ]);

        return response()->json([
            'message' => 'Transaction updated successfully',
            'data' => $transaction,
        ]);
    }

    /**
     * Delete an existing transaction.
     */
    public function destroyTransaction(string $id): JsonResponse
    {
        $transaction = HisabTransaction::where('external_id', $id)
            ->orWhere('id', $id)
            ->firstOrFail();

        $tenantId = $transaction->tenant_id;
        $amount = $transaction->amount;
        $notes = $transaction->notes;

        $transaction->delete();

        \App\Models\MemberActivityLog::record($tenantId, auth()->id(), null, 'item_deleted', [
            'type' => 'hisab',
            'name' => $notes ?: 'Transaction',
            'amount' => (string) $amount
        ]);

        return response()->json([
            'message' => 'Transaction deleted successfully',
        ]);
    }

    /**
     * Update an existing debt.
     */
    public function updateDebt(Request $request, string $id): JsonResponse
    {
        $debt = HisabDebt::where('external_id', $id)
            ->orWhere('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'direction' => 'required|in:lent,borrowed',
            'person_name' => 'required|string|max:100',
            'person_phone' => 'nullable|string|max:30',
            'amount' => 'required|numeric|min:1',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $debt->update($validated);

        \App\Models\MemberActivityLog::record($debt->tenant_id, auth()->id(), null, 'item_updated', [
            'type' => 'debt',
            'name' => $debt->person_name,
            'amount' => (string) $debt->amount
        ]);

        return response()->json([
            'message' => 'Debt updated successfully',
            'data' => $debt,
        ]);
    }

    /**
     * Delete an existing debt.
     */
    public function destroyDebt(string $id): JsonResponse
    {
        $debt = HisabDebt::where('external_id', $id)
            ->orWhere('id', $id)
            ->firstOrFail();

        $tenantId = $debt->tenant_id;
        $amount = $debt->amount;
        $personName = $debt->person_name;

        $debt->delete();

        \App\Models\MemberActivityLog::record($tenantId, auth()->id(), null, 'item_deleted', [
            'type' => 'debt',
            'name' => $personName,
            'amount' => (string) $amount
        ]);

        return response()->json([
            'message' => 'Debt deleted successfully',
        ]);
    }

    /**
     * Generate multi-period financial spending report and analytics.
     */
    public function getReport(Request $request): JsonResponse
    {
        $period = $request->input('period', 'this_month');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        if ($fromDate && $toDate) {
            $from = Carbon::parse($fromDate)->startOfDay();
            $to = Carbon::parse($toDate)->endOfDay();
            $periodLabel = $from->format('M j, Y') . ' – ' . $to->format('M j, Y');
        } elseif ($month = $request->input('month')) {
            $from = Carbon::parse($month . '-01')->startOfMonth();
            $to = (clone $from)->endOfMonth();
            $periodLabel = $from->format('F Y');
        } else {
            switch ($period) {
                case 'last_month':
                    $from = now()->subMonth()->startOfMonth();
                    $to = now()->subMonth()->endOfMonth();
                    $periodLabel = $from->format('F Y');
                    break;
                case 'last_3_months':
                case 'quarter':
                    $from = now()->subMonths(2)->startOfMonth();
                    $to = now()->endOfMonth();
                    $periodLabel = $from->format('M Y') . ' – ' . $to->format('M Y');
                    break;
                case 'year_to_date':
                case 'ytd':
                    $from = now()->startOfYear();
                    $to = now()->endOfMonth();
                    $periodLabel = 'YTD ' . $from->format('Y');
                    break;
                case 'all':
                    $from = Carbon::create(2020, 1, 1);
                    $to = now()->endOfDay();
                    $periodLabel = 'All Time';
                    break;
                case 'this_month':
                default:
                    $from = now()->startOfMonth();
                    $to = now()->endOfMonth();
                    $periodLabel = $from->format('F Y');
                    break;
            }
        }

        $fromStr = $from->format('Y-m-d');
        $toStr = $to->format('Y-m-d');

        // Income & Expense totals
        $income = (float) HisabTransaction::where('type', 'income')
            ->whereBetween('transaction_date', [$fromStr, $toStr])
            ->sum('amount');

        $incomeCount = (int) HisabTransaction::where('type', 'income')
            ->whereBetween('transaction_date', [$fromStr, $toStr])
            ->count();

        $expenses = (float) HisabTransaction::where('type', 'expense')
            ->whereBetween('transaction_date', [$fromStr, $toStr])
            ->sum('amount');

        $expenseCount = (int) HisabTransaction::where('type', 'expense')
            ->whereBetween('transaction_date', [$fromStr, $toStr])
            ->count();

        $net = $income - $expenses;
        $savingsRate = $income > 0 ? round(($net / $income) * 100) : ($net >= 0 ? 100 : 0);

        // Days in period for daily average
        $daysCount = max(1, $from->diffInDays(min($to, now())) + 1);
        $dailyAverage = round($expenses / $daysCount, 2);

        // Category breakdown
        $categories = HisabTransaction::where('type', 'expense')
            ->whereBetween('transaction_date', [$fromStr, $toStr])
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

        // Family member attribution (who spent what)
        $members = HisabTransaction::where('type', 'expense')
            ->whereBetween('transaction_date', [$fromStr, $toStr])
            ->with('creator:id,name,email')
            ->selectRaw('created_by, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('created_by')
            ->orderBy('total', 'desc')
            ->get()
            ->map(function ($m) use ($expenses) {
                $total = (float) $m->total;
                $pct = $expenses > 0 ? round(($total / $expenses) * 100) : 0;
                return [
                    'user_id' => $m->created_by,
                    'name' => $m->creator?->name ?: 'Household Member',
                    'total' => $total,
                    'count' => (int) $m->count,
                    'percentage' => $pct,
                ];
            });

        // Transactions list for detailed reporting / CSV export
        $transactions = HisabTransaction::whereBetween('transaction_date', [$fromStr, $toStr])
            ->with('creator:id,name')
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'type' => $t->type,
                    'amount' => (float) $t->amount,
                    'category' => $t->category ?: 'General',
                    'notes' => $t->notes ?: '',
                    'transaction_date' => Carbon::parse((string) $t->transaction_date)->format('Y-m-d'),
                    'creator_name' => $t->creator?->name ?: 'Household Member',
                ];
            });

        // 6-Month historical trend
        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $mDate = now()->subMonths($i);
            $mKey = $mDate->format('Y-m');
            $mLabel = $mDate->format('M Y');
            $mInc = (float) HisabTransaction::where('type', 'income')
                ->where('transaction_date', 'like', "{$mKey}%")
                ->sum('amount');
            $mExp = (float) HisabTransaction::where('type', 'expense')
                ->where('transaction_date', 'like', "{$mKey}%")
                ->sum('amount');
            $monthlyTrend[] = [
                'month' => $mKey,
                'label' => $mLabel,
                'income' => $mInc,
                'expense' => $mExp,
                'net' => $mInc - $mExp,
            ];
        }

        return response()->json([
            'data' => [
                'period' => [
                    'key' => $period,
                    'label' => $periodLabel,
                    'from' => $fromStr,
                    'to' => $toStr,
                ],
                'summary' => [
                    'total_income' => $income,
                    'income_count' => $incomeCount,
                    'total_expense' => $expenses,
                    'expense_count' => $expenseCount,
                    'net_savings' => $net,
                    'savings_rate' => $savingsRate,
                    'daily_average' => $dailyAverage,
                ],
                'categories' => $categories->values()->all(),
                'members' => $members->values()->all(),
                'monthly_trend' => $monthlyTrend,
                'transactions' => $transactions->values()->all(),
            ],
        ]);
    }

    /**
     * List savings goals for the tenant.
     */
    public function indexSavingsGoals(Request $request): JsonResponse
    {
        $goals = HisabSavingsGoal::with(['creator:id,name', 'contributions'])
            ->orderBy('status', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $goals]);
    }

    /**
     * Store a new savings goal.
     */
    public function storeSavingsGoal(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'category' => 'nullable|string|max:50',
            'target_amount' => 'required|numeric|min:1',
            'current_amount' => 'nullable|numeric|min:0',
            'target_date' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $goal = HisabSavingsGoal::create([
            'name' => $validated['name'],
            'category' => $validated['category'] ?? 'General',
            'target_amount' => $validated['target_amount'],
            'current_amount' => $validated['current_amount'] ?? 0,
            'target_date' => $validated['target_date'] ?? null,
            'status' => 'active',
            'notes' => $validated['notes'] ?? null,
            'created_by' => $request->user()?->id,
        ]);

        if (!empty($validated['current_amount']) && $validated['current_amount'] > 0) {
            HisabSavingsContribution::create([
                'tenant_id' => $goal->tenant_id,
                'goal_id' => $goal->id,
                'amount' => $validated['current_amount'],
                'payment_method' => 'Cash',
                'notes' => 'Initial savings deposit',
                'created_by' => $request->user()?->id,
            ]);
        }

        return response()->json([
            'message' => 'Savings goal created successfully.',
            'data' => $goal->fresh(['contributions', 'creator:id,name']),
        ], 201);
    }

    /**
     * Get a specific savings goal.
     */
    public function showSavingsGoal($id): JsonResponse
    {
        $goal = HisabSavingsGoal::with(['creator:id,name', 'contributions.creator:id,name'])->findOrFail($id);
        return response()->json(['data' => $goal]);
    }

    /**
     * Update an existing savings goal.
     */
    public function updateSavingsGoal(Request $request, $id): JsonResponse
    {
        $goal = HisabSavingsGoal::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'category' => 'nullable|string|max:50',
            'target_amount' => 'sometimes|required|numeric|min:1',
            'target_date' => 'nullable|date',
            'status' => 'sometimes|required|in:active,reached,cancelled',
            'notes' => 'nullable|string|max:500',
        ]);

        $goal->update($validated);

        return response()->json([
            'message' => 'Savings goal updated successfully.',
            'data' => $goal->fresh(['contributions', 'creator:id,name']),
        ]);
    }

    /**
     * Delete a savings goal.
     */
    public function destroySavingsGoal($id): JsonResponse
    {
        $goal = HisabSavingsGoal::findOrFail($id);
        $goal->delete();

        return response()->json(['message' => 'Savings goal deleted successfully.']);
    }

    /**
     * Add a deposit / contribution to a savings goal.
     */
    public function depositToSavingsGoal(Request $request, $id): JsonResponse
    {
        $goal = HisabSavingsGoal::findOrFail($id);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:255',
        ]);

        $amount = (float) $validated['amount'];
        $contribution = HisabSavingsContribution::create([
            'tenant_id' => $goal->tenant_id,
            'goal_id' => $goal->id,
            'amount' => $amount,
            'payment_method' => $validated['payment_method'] ?? 'Cash',
            'notes' => $validated['notes'] ?? null,
            'created_by' => $request->user()?->id,
        ]);

        $goal->increment('current_amount', $amount);

        if ($goal->fresh()->current_amount >= $goal->target_amount && $goal->status === 'active') {
            $goal->update(['status' => 'reached']);
        }

        return response()->json([
            'message' => 'Savings deposit added successfully.',
            'data' => [
                'goal' => $goal->fresh(['contributions', 'creator:id,name']),
                'contribution' => $contribution,
            ],
        ]);
    }
}
