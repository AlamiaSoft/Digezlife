<?php

declare(strict_types=1);

namespace Modules\Giveback\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\Giveback\Models\ReferralAttribution;
use Modules\Giveback\Services\ReferralRewardService;

class ReferralController extends Controller
{
    public function __construct(private readonly ReferralRewardService $referralService) {}

    /**
     * Get user's referral code and referral stats.
     */
    public function code(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $code = $this->referralService->getReferralCode($user);

        $qualifiedCount = ReferralAttribution::where('referrer_user_id', $user->id)
            ->whereIn('status', ['qualified', 'rewarded'])
            ->count();

        $inviteUrl = "https://gharlyapp.com/#/signup?ref={$code}";

        return response()->json([
            'data' => [
                'referral_code'   => $code,
                'invite_url'      => $inviteUrl,
                'qualified_count' => $qualifiedCount,
                'share_text'      => "Join me on GharlyApp! Use my referral code {$code} when signing up: {$inviteUrl}",
            ],
        ]);
    }
}
