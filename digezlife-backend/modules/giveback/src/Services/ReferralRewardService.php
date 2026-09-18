<?php

declare(strict_types=1);

namespace Modules\Giveback\Services;

use App\Models\User;
use Modules\Giveback\Models\ReferralAttribution;
use Modules\Giveback\Models\ReferralCampaign;

class ReferralRewardService
{
    public function __construct(private readonly RewardService $rewardService) {}

    /**
     * Get or generate a unique referral code for a user.
     */
    public function getReferralCode(User $user): string
    {
        if ($user->referral_code) {
            return $user->referral_code;
        }

        $code = 'GHARLY-' . strtoupper(substr(md5((string) $user->id . time()), 0, 6));
        $user->update(['referral_code' => $code]);

        return $code;
    }

    /**
     * Process referral link on signup.
     */
    public function processReferralOnSignup(User $newUserId, string $referralCode): ?ReferralAttribution
    {
        $referrer = User::where('referral_code', $referralCode)->first();
        if (!$referrer || $referrer->id === $newUserId->id) {
            return null; // Self-referral guard or invalid code
        }

        $newUserId->update(['referred_by_user_id' => $referrer->id]);

        $campaign = ReferralCampaign::where('is_active', true)->latest()->first();

        $idempotencyKey = "ref_attr_{$referrer->id}_{$newUserId->id}";

        $attribution = ReferralAttribution::firstOrCreate(
            ['idempotency_key' => $idempotencyKey],
            [
                'campaign_id'      => $campaign?->id,
                'referrer_user_id' => $referrer->id,
                'referee_user_id'  => $newUserId->id,
                'status'           => 'qualified',
                'qualified_at'     => now(),
            ]
        );

        if ($attribution->wasRecentlyCreated && $campaign) {
            // Issue referrer reward
            $referrerTenant = $referrer->tenants()->first();
            if ($referrerTenant && $campaign->referrer_reward_minor > 0) {
                $this->rewardService->issueReward([
                    'tenant_id'      => $referrerTenant->id,
                    'user_id'        => $referrer->id,
                    'type'           => 'referral',
                    'source_type'    => 'referral_attribution',
                    'source_id'      => (string) $attribution->id,
                    'amount_minor'   => $campaign->referrer_reward_minor,
                    'currency'       => $campaign->currency ?? 'PKR',
                    'idempotency_key'=> "ref_rw_referrer_{$attribution->id}",
                    'metadata'       => ['referee_id' => $newUserId->id],
                ]);
            }

            // Issue referee reward
            $refereeTenant = $newUserId->tenants()->first();
            if ($refereeTenant && $campaign->referee_reward_minor > 0) {
                $this->rewardService->issueReward([
                    'tenant_id'      => $refereeTenant->id,
                    'user_id'        => $newUserId->id,
                    'type'           => 'referral',
                    'source_type'    => 'referral_attribution',
                    'source_id'      => (string) $attribution->id,
                    'amount_minor'   => $campaign->referee_reward_minor,
                    'currency'       => $campaign->currency ?? 'PKR',
                    'idempotency_key'=> "ref_rw_referee_{$attribution->id}",
                    'metadata'       => ['referrer_id' => $referrer->id],
                ]);
            }

            $attribution->update(['status' => 'rewarded', 'reward_issued_at' => now()]);
        }

        return $attribution;
    }
}
