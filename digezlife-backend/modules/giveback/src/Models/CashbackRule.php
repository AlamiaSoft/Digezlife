<?php

declare(strict_types=1);

namespace Modules\Giveback\Models;

use Illuminate\Database\Eloquent\Model;

class CashbackRule extends Model
{
    protected $fillable = [
        'name',
        'type',
        'amount_minor',
        'percentage_bp',
        'max_reward_minor',
        'min_qualifying_minor',
        'subscription_tier',
        'starts_at',
        'ends_at',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'amount_minor'         => 'integer',
        'percentage_bp'        => 'integer',
        'max_reward_minor'     => 'integer',
        'min_qualifying_minor' => 'integer',
        'starts_at'            => 'datetime',
        'ends_at'              => 'datetime',
        'is_active'            => 'boolean',
        'metadata'             => 'array',
    ];
}
