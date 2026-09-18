<?php

declare(strict_types=1);

namespace Modules\Giveback\Services;

use Modules\Giveback\Models\Reward;
use Modules\Giveback\Models\RewardLedgerEntry;

class RewardLedgerService
{
    /**
     * Append an immutable entry to the reward ledger and return running balance.
     */
    public function recordEvent(
        Reward $reward,
        string $eventType,
        int $amountMinor = 0,
        int $points = 0,
        ?string $sourceType = null,
        ?string $sourceId = null,
        array $metadata = []
    ): RewardLedgerEntry {
        $currency = $reward->currency ?? 'PKR';

        // Calculate running balances for household
        $currentCashbackBalance = RewardLedgerEntry::where('tenant_id', $reward->tenant_id)
            ->latest('id')
            ->value('balance_after_minor') ?? 0;

        $currentPointsBalance = RewardLedgerEntry::where('tenant_id', $reward->tenant_id)
            ->latest('id')
            ->value('points_after') ?? 0;

        $newBalance = $currentCashbackBalance + $amountMinor;
        $newPoints = $currentPointsBalance + $points;

        return RewardLedgerEntry::create([
            'reward_id'           => $reward->id,
            'tenant_id'           => $reward->tenant_id,
            'user_id'             => $reward->user_id,
            'event_type'          => $eventType,
            'amount_minor'        => $amountMinor,
            'points'              => $points,
            'currency'            => $currency,
            'balance_after_minor' => max(0, $newBalance),
            'points_after'        => max(0, $newPoints),
            'source_type'         => $sourceType ?? $reward->source_type,
            'source_id'           => $sourceId ?? $reward->source_id,
            'metadata'            => $metadata,
            'created_at'          => now(),
        ]);
    }

    /**
     * Compute current available balances for a household.
     */
    public function getHouseholdBalance(string $tenantId): array
    {
        $cashbackAvailable = Reward::where('tenant_id', $tenantId)
            ->where('status', 'available')
            ->whereIn('type', ['cashback', 'referral'])
            ->sum('amount_minor');

        $creditsAvailable = Reward::where('tenant_id', $tenantId)
            ->where('status', 'available')
            ->where('type', 'subscription_credit')
            ->sum('amount_minor');

        $pointsAvailable = Reward::where('tenant_id', $tenantId)
            ->where('status', 'available')
            ->where('type', 'points')
            ->sum('points');

        return [
            'cashback_minor' => (int) $cashbackAvailable,
            'credits_minor'  => (int) $creditsAvailable,
            'points'         => (int) $pointsAvailable,
            'currency'       => 'PKR',
        ];
    }
}
