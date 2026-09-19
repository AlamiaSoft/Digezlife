<?php

namespace Modules\Grocery\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Grocery\Models\GroceryItem;
use Modules\Grocery\Models\GroceryList;

class GroceryController extends Controller
{
    /**
     * List all grocery lists with item counts.
     */
    public function indexLists(Request $request): JsonResponse
    {
        $lists = GroceryList::withCount([
            'items as total_items',
            'items as pending_items' => fn ($query) => $query->where('is_checked', false),
        ])->where('is_archived', false)->get();

        return response()->json([
            'data' => $lists,
        ]);
    }

    /**
     * Create a new grocery list.
     */
    public function storeList(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:30',
        ]);

        $tenantId = (function_exists('tenant') && tenant('id'))
            ? (string) tenant('id')
            : ($request->route('tenant') ?: $request->header('X-Tenant-ID') ?: ($request->user()?->tenants()->first()?->id) ?: 'demo-household');

        $list = GroceryList::create([
            ...$validated,
            'tenant_id' => $tenantId,
        ]);

        return response()->json([
            'message' => 'Grocery list created successfully',
            'data' => $list,
        ], 201);
    }

    /**
     * Get single list with items.
     */
    public function showList(string $listId): JsonResponse
    {
        $list = GroceryList::where('external_id', $listId)
            ->orWhere('id', $listId)
            ->with('items.creator')
            ->firstOrFail();

        return response()->json([
            'data' => $list,
        ]);
    }

    /**
     * Add an item to a grocery list.
     */
    public function storeItem(Request $request, string $listId): JsonResponse
    {
        $list = GroceryList::where('external_id', $listId)
            ->orWhere('id', $listId)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'quantity' => 'nullable|numeric|min:0.1',
            'unit' => 'nullable|string|max:20',
            'category' => 'nullable|string|max:50',
            'is_recurring' => 'nullable|boolean',
        ]);

        $item = $list->items()->create([
            'name' => $validated['name'],
            'quantity' => $validated['quantity'] ?? 1,
            'unit' => $validated['unit'] ?? 'pcs',
            'category' => $validated['category'] ?? 'General',
            'is_recurring' => $validated['is_recurring'] ?? false,
            'is_checked' => false,
            'created_by' => auth()->id(),
        ]);

        $item->load('creator');

        \App\Models\MemberActivityLog::record($list->tenant_id, auth()->id(), null, 'item_created', [
            'type' => 'grocery',
            'name' => $item->name,
            'amount' => $item->quantity . ' ' . $item->unit
        ]);

        return response()->json([
            'message' => 'Item added to grocery list',
            'data' => $item,
        ], 201);
    }

    /**
     * Toggle checked state of an item.
     */
    public function toggleItem(Request $request, string $listId, string $itemId): JsonResponse
    {
        $item = GroceryItem::where('external_id', $itemId)
            ->orWhere('id', $itemId)
            ->firstOrFail();

        $newCheckedState = ! $item->is_checked;
        $item->update([
            'is_checked' => $newCheckedState,
            'checked_at' => $newCheckedState ? now() : null,
        ]);

        return response()->json([
            'message' => $newCheckedState ? 'Item marked as bought' : 'Item marked as pending',
            'data' => $item,
        ]);
    }

    /**
     * Delete an item.
     */
    public function destroyItem(string $listId, string $itemId): JsonResponse
    {
        $item = GroceryItem::where('external_id', $itemId)
            ->orWhere('id', $itemId)
            ->firstOrFail();

        $list = GroceryList::where('external_id', $listId)
            ->orWhere('id', $listId)
            ->first();

        $tenantId = $list ? $list->tenant_id : null;
        $name = $item->name;
        $amount = $item->quantity . ' ' . $item->unit;

        $item->delete();

        \App\Models\MemberActivityLog::record($tenantId, auth()->id(), null, 'item_deleted', [
            'type' => 'grocery',
            'name' => $name,
            'amount' => $amount
        ]);

        return response()->json([
            'message' => 'Item removed from grocery list',
        ]);
    }

    /**
     * Update an item.
     */
    public function updateItem(Request $request, string $listId, string $itemId): JsonResponse
    {
        $item = GroceryItem::where('external_id', $itemId)
            ->orWhere('id', $itemId)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'quantity' => 'nullable|numeric|min:0.1',
            'unit' => 'nullable|string|max:20',
            'category' => 'nullable|string|max:50',
            'is_recurring' => 'nullable|boolean',
        ]);

        $item->update([
            'name' => $validated['name'],
            'quantity' => $validated['quantity'] ?? 1,
            'unit' => $validated['unit'] ?? 'pcs',
            'category' => $validated['category'] ?? 'General',
            'is_recurring' => $validated['is_recurring'] ?? false,
        ]);

        $list = GroceryList::where('external_id', $listId)->orWhere('id', $listId)->first();

        \App\Models\MemberActivityLog::record($list ? $list->tenant_id : null, auth()->id(), null, 'item_updated', [
            'type' => 'grocery',
            'name' => $item->name,
            'amount' => $item->quantity . ' ' . $item->unit
        ]);

        return response()->json([
            'message' => 'Item updated successfully',
            'data' => $item,
        ]);
    }

    /**
     * Export list as clean WhatsApp text.
     */
    public function exportWhatsApp(string $listId): JsonResponse
    {
        $list = GroceryList::where('external_id', $listId)
            ->orWhere('id', $listId)
            ->with('items')
            ->firstOrFail();

        $pending = $list->items->where('is_checked', false);
        $bought = $list->items->where('is_checked', true);

        $text = "*DigEzLife Grocery List: {$list->name}*\n";
        $text .= "Date: ".now()->format('d M Y')."\n\n";

        if ($pending->isNotEmpty()) {
            $text .= "*Items to Buy:*\n";
            foreach ($pending as $item) {
                $qty = $item->quantity == intval($item->quantity) ? intval($item->quantity) : $item->quantity;
                $text .= "- [ ] {$item->name} ({$qty} {$item->unit})\n";
            }
        }

        if ($bought->isNotEmpty()) {
            $text .= "\n*Already Bought:*\n";
            foreach ($bought as $item) {
                $text .= "- [x] ~{$item->name}~\n";
            }
        }

        $text .= "\nShared via DigEzLife (https://digezlife.app)";

        $waUrl = "https://wa.me/?text=".urlencode($text);

        return response()->json([
            'data' => [
                'formatted_text' => $text,
                'whatsapp_url' => $waUrl,
            ],
        ]);
    }
}
