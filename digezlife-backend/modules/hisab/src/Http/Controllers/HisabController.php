<?php

namespace Modules\Hisab\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Hisab\Models\HisabDebt;
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
            'category' => 'required|string|max:50',
            'payment_method' => 'nullable|string|max:30',
            'transaction_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $transaction = HisabTransaction::create([
            ...$validated,
            'currency' => $validated['currency'] ?? 'PKR',
            'payment_method' => $validated['payment_method'] ?? 'Cash',
            'created_by' => $request->user()?->id,
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

        $debt = HisabDebt::create($validated);

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
}
