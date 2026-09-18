<?php

declare(strict_types=1);

namespace Modules\Giveback\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\Giveback\Models\GivebackPool;
use Modules\Giveback\Models\Reward;
use Modules\Giveback\Models\RewardLedgerEntry;
use Modules\Giveback\Services\RewardLedgerService;
use Modules\Giveback\Services\RewardService;

class RewardController extends Controller
{
    public function __construct(
        private readonly RewardLedgerService $ledger,
        private readonly RewardService $rewardService
    ) {}

    /**
     * Get reward summary balance for the authenticated household.
     */
    public function summary(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tenantId = $request->header('X-Tenant-ID') ?: $request->query('household_id');

        if (!$tenantId) {
            $tenant = $user->tenants()->first();
            $tenantId = $tenant?->id ?? '';
        }

        $balance = $this->ledger->getHouseholdBalance($tenantId);

        // Fetch current active giveback pool percentage
        $currentPool = GivebackPool::where('status', 'active')->latest()->first();
        $givebackPercent = $currentPool ? ($currentPool->percentage_bp / 100) : 20.0;

        return response()->json([
            'data' => [
                'cashback_minor'   => $balance['cashback_minor'],
                'cashback_formatted' => 'PKR ' . number_format($balance['cashback_minor'] / 100, 2),
                'credits_minor'    => $balance['credits_minor'],
                'credits_formatted'  => 'PKR ' . number_format($balance['credits_minor'] / 100, 2),
                'points'           => $balance['points'],
                'available_total_minor' => $balance['cashback_minor'] + $balance['credits_minor'],
                'available_total_formatted' => 'PKR ' . number_format(($balance['cashback_minor'] + $balance['credits_minor']) / 100, 2),
                'giveback_percentage' => $givebackPercent,
                'currency'         => 'PKR',
            ],
        ]);
    }

    /**
     * Get paginated rewards list for household.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tenantId = $request->header('X-Tenant-ID') ?: $request->query('household_id');

        if (!$tenantId) {
            $tenant = $user->tenants()->first();
            $tenantId = $tenant?->id ?? '';
        }

        $query = Reward::where('tenant_id', $tenantId);

        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $rewards = $query->latest('earned_at')->paginate(20);

        return response()->json($rewards);
    }

    /**
     * Get append-only ledger history.
     */
    public function history(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tenantId = $request->header('X-Tenant-ID') ?: $request->query('household_id');

        if (!$tenantId) {
            $tenant = $user->tenants()->first();
            $tenantId = $tenant?->id ?? '';
        }

        $entries = RewardLedgerEntry::where('tenant_id', $tenantId)
            ->latest('created_at')
            ->paginate(30);

        return response()->json($entries);
    }

    /**
     * Request redemption of available rewards.
     */
    public function redeem(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tenantId = $request->header('X-Tenant-ID') ?: $request->query('household_id');

        if (!$tenantId) {
            $tenant = $user->tenants()->first();
            $tenantId = $tenant?->id ?? '';
        }

        $validated = $request->validate([
            'reward_id'       => 'nullable|exists:rewards,id',
            'redemption_type' => 'required|string|in:subscription_credit,service_credit,partner_voucher',
            'amount_minor'    => 'nullable|integer|min:1',
        ]);

        $reward = null;
        if (!empty($validated['reward_id'])) {
            $reward = Reward::where('tenant_id', $tenantId)
                ->where('id', $validated['reward_id'])
                ->first();
        } else {
            // Find first available reward of appropriate type
            $reward = Reward::where('tenant_id', $tenantId)
                ->where('status', 'available')
                ->latest()
                ->first();
        }

        if (!$reward || !$reward->isAvailable()) {
            return response()->json(['message' => 'No eligible available reward found for redemption.'], 422);
        }

        $this->rewardService->redeemReward($reward, [
            'redemption_type' => $validated['redemption_type'],
            'redeemed_by'     => $user->id,
            'redemption_id'   => 'rdm_' . bin2hex(random_bytes(6)),
        ]);

        return response()->json([
            'message' => 'Reward redeemed successfully.',
            'data'    => [
                'reward_id' => $reward->id,
                'status'    => 'redeemed',
                'type'      => $validated['redemption_type'],
            ],
        ]);
    }
}
