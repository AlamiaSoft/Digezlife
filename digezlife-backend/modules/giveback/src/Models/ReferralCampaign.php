<?php

declare(strict_types=1);

namespace Modules\Giveback\Models;

use Illuminate\Database\Eloquent\Model;

class ReferralCampaign extends Model
{
    protected $fillable = [
        'name',
        'referrer_reward_minor',
        'referee_reward_minor',
        'currency',
        'qualifying_event',
        'reward_delay_days',
        'max_referrals_per_user',
        'starts_at',
        'ends_at',
        'is_active',
    ];

    protected $casts = [
        'referrer_reward_minor' => 'integer',
        'referee_reward_minor'  => 'integer',
        'reward_delay_days'     => 'integer',
        'max_referrals_per_user'=> 'integer',
        'starts_at'             => 'datetime',
        'ends_at'               => 'datetime',
        'is_active'             => 'boolean',
    ];
}
