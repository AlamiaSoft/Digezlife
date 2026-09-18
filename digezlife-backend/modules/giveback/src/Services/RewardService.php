<?php

declare(strict_types=1);

namespace Modules\Giveback\Services;

use Modules\Giveback\Models\Reward;

class RewardService
{
    public function __construct(private readonly RewardLedgerService $ledger) {}

    /**
     * Create a new reward and record REWARD_EARNED event.
     */
    public function issueReward(array $data): Reward
    {
        $idempotencyKey = $data['idempotency_key'] ?? 'rwd_evt_' . bin2hex(random_bytes(8));

        $reward = Reward::firstOrCreate(
            ['idempotency_key' => $idempotencyKey],
            [
                'tenant_id'       => $data['tenant_id'],
                'user_id'         => $data['user_id'] ?? null,
                'type'            => $data['type'], // cashback, referral, subscription_credit, points
                'source_type'     => $data['source_type'] ?? null,
                'source_id'       => $data['source_id'] ?? null,
                'allocation_id'   => $data['allocation_id'] ?? null,
                'amount_minor'    => $data['amount_minor'] ?? 0,
                'points'          => $data['points'] ?? 0,
                'currency'        => $data['currency'] ?? 'PKR',
                'status'          => $data['status'] ?? 'available',
                'earned_at'       => now(),
                'available_at'    => $data['available_at'] ?? now(),
                'expires_at'      => $data['expires_at'] ?? null,
                'visibility'      => $data['visibility'] ?? 'household',
                'metadata'        => $data['metadata'] ?? [],
            ]
        );

        if ($reward->wasRecentlyCreated) {
            $this->ledger->recordEvent(
                $reward,
                'REWARD_EARNED',
                (int) ($reward->amount_minor ?? 0),
                (int) ($reward->points ?? 0),
                $reward->source_type,
                $reward->source_id,
                $reward->metadata ?? []
            );
        }

        return $reward;
    }

    /**
     * Transition a reward to redeemed.
     */
    public function redeemReward(Reward $reward, array $redemptionData = []): bool
    {
        if (!$reward->isAvailable()) {
            throw new \DomainException('Reward is not available for redemption.');
        }

        $reward->update([
            'status'      => 'redeemed',
            'redeemed_at' => now(),
        ]);

        $this->ledger->recordEvent(
            $reward,
            'REWARD_REDEEMED',
            -((int) ($reward->amount_minor ?? 0)),
            -((int) ($reward->points ?? 0)),
            'redemption',
            (string) ($redemptionData['redemption_id'] ?? ''),
            $redemptionData
        );

        return true;
    }

    /**
     * Reverse a reward.
     */
    public function reverseReward(Reward $reward, string $reason = ''): bool
    {
        if (in_array($reward->status, ['reversed', 'cancelled'], true)) {
            return false;
        }

        $oldStatus = $reward->status;
        $reward->update([
            'status'      => 'reversed',
            'reversed_at' => now(),
        ]);

        if ($oldStatus === 'available') {
            $this->ledger->recordEvent(
                $reward,
                'REWARD_REVERSED',
                -((int) ($reward->amount_minor ?? 0)),
                -((int) ($reward->points ?? 0)),
                'reversal',
                null,
                ['reason' => $reason]
            );
        }

        return true;
    }
}
