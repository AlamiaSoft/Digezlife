<?php

namespace Modules\Reminders\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Reminders\Models\Reminder;

class ReminderController extends Controller
{
    /**
     * List reminders with upcoming vs completed separation.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Reminder::query();

        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        if ($request->has('is_completed')) {
            $query->where('is_completed', filter_var($request->input('is_completed'), FILTER_VALIDATE_BOOLEAN));
        }

        $reminders = $query->orderBy('is_completed', 'asc')
            ->orderBy('due_at', 'asc')
            ->get();

        return response()->json([
            'data' => $reminders,
        ]);
    }

    /**
     * Create a new reminder.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string|max:500',
            'category' => 'nullable|string|max:50',
            'due_at' => 'required|date',
            'recurrence_rule' => 'nullable|in:none,daily,weekly,monthly,yearly',
            'notification_channels' => 'nullable|array',
        ]);

        $reminder = Reminder::create([
            ...$validated,
            'category' => $validated['category'] ?? 'General',
            'recurrence_rule' => $validated['recurrence_rule'] ?? 'none',
            'notification_channels' => $validated['notification_channels'] ?? ['push'],
            'is_completed' => false,
        ]);

        return response()->json([
            'message' => 'Reminder scheduled successfully',
            'data' => $reminder,
        ], 201);
    }

    /**
     * Show single reminder.
     */
    public function show(string $id): JsonResponse
    {
        $reminder = Reminder::where('external_id', $id)
            ->orWhere('id', $id)
            ->firstOrFail();

        return response()->json([
            'data' => $reminder,
        ]);
    }

    /**
     * Update reminder.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $reminder = Reminder::where('external_id', $id)
            ->orWhere('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'title' => 'sometimes|string|max:150',
            'description' => 'nullable|string|max:500',
            'category' => 'sometimes|string|max:50',
            'due_at' => 'sometimes|date',
            'recurrence_rule' => 'sometimes|in:none,daily,weekly,monthly,yearly',
            'notification_channels' => 'nullable|array',
        ]);

        $reminder->update($validated);

        return response()->json([
            'message' => 'Reminder updated successfully',
            'data' => $reminder,
        ]);
    }

    /**
     * Toggle reminder completion.
     */
    public function toggleComplete(string $id): JsonResponse
    {
        $reminder = Reminder::where('external_id', $id)
            ->orWhere('id', $id)
            ->firstOrFail();

        $newCompleted = ! $reminder->is_completed;
        $reminder->update([
            'is_completed' => $newCompleted,
            'completed_at' => $newCompleted ? now() : null,
        ]);

        return response()->json([
            'message' => $newCompleted ? 'Reminder marked completed' : 'Reminder marked pending',
            'data' => $reminder,
        ]);
    }

    /**
     * Delete a reminder.
     */
    public function destroy(string $id): JsonResponse
    {
        $reminder = Reminder::where('external_id', $id)
            ->orWhere('id', $id)
            ->firstOrFail();

        $reminder->delete();

        return response()->json([
            'message' => 'Reminder deleted successfully',
        ]);
    }
}
