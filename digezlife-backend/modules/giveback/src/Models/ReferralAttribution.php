<?php

declare(strict_types=1);

namespace Modules\Giveback\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReferralAttribution extends Model
{
    protected $fillable = [
        'campaign_id',
        'referrer_user_id',
        'referee_user_id',
        'status',
        'qualified_at',
        'reward_issued_at',
        'idempotency_key',
    ];

    protected $casts = [
        'qualified_at'     => 'datetime',
        'reward_issued_at' => 'datetime',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(ReferralCampaign::class);
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referrer_user_id');
    }

    public function referee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referee_user_id');
    }
}
