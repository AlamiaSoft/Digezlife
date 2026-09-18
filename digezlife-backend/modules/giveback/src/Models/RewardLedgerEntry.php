<?php

declare(strict_types=1);

namespace Modules\Giveback\Models;

use Alamia\Core\Tenant\Models\Traits\BelongsToTenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RewardLedgerEntry extends Model
{
    use BelongsToTenant;

    public $timestamps = false;

    protected $fillable = [
        'reward_id',
        'tenant_id',
        'user_id',
        'event_type',
        'amount_minor',
        'points',
        'currency',
        'balance_after_minor',
        'points_after',
        'source_type',
        'source_id',
        'metadata',
        'created_at',
    ];

    protected $casts = [
        'amount_minor'        => 'integer',
        'points'              => 'integer',
        'balance_after_minor' => 'integer',
        'points_after'        => 'integer',
        'metadata'            => 'array',
        'created_at'          => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(fn ($entry) => $entry->created_at ??= now());
    }

    public function reward(): BelongsTo
    {
        return $this->belongsTo(Reward::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
