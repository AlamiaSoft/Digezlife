<?php

declare(strict_types=1);

namespace Modules\Giveback\Models;

use Alamia\Core\Shared\Traits\HasExternalId;
use Alamia\Core\Tenant\Models\Traits\BelongsToTenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reward extends Model
{
    use BelongsToTenant, HasExternalId, HasFactory;

    protected $fillable = [
        'external_id',
        'tenant_id',
        'user_id',
        'type',
        'source_type',
        'source_id',
        'allocation_id',
        'amount_minor',
        'points',
        'currency',
        'status',
        'earned_at',
        'available_at',
        'expires_at',
        'redeemed_at',
        'reversed_at',
        'idempotency_key',
        'visibility',
        'metadata',
    ];

    protected $casts = [
        'amount_minor' => 'integer',
        'points'       => 'integer',
        'earned_at'    => 'datetime',
        'available_at' => 'datetime',
        'expires_at'   => 'datetime',
        'redeemed_at'  => 'datetime',
        'reversed_at'  => 'datetime',
        'metadata'     => 'array',
    ];

    protected static function getExternalIdPrefix(): string
    {
        return 'RWD';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(RewardLedgerEntry::class);
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available' && ($this->expires_at === null || $this->expires_at->isFuture());
    }
}
