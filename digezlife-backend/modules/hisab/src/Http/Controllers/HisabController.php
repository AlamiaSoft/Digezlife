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

        $transactions = $query->orderBy('transaction_date', 'desc')
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

        $lentTotal = (float) HisabDebt::where('direction', 'lent')
            ->where('status', '!=', 'settled')
            ->selectRaw('SUM(amount - paid_amount) as total')
            ->value('total') ?? 0;

        $borrowedTotal = (float) HisabDebt::where('direction', 'borrowed')
            ->where('status', '!=', 'settled')
            ->selectRaw('SUM(amount - paid_amount) as total')
            ->value('total') ?? 0;

        return response()->json([
            'data' => [
                'month' => $month,
                'total_income' => $income,
                'total_expense' => $expense,
                'net_savings' => $net,
                'categories' => $byCategory,
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
