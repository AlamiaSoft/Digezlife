<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberActivityLog extends Model
{
    protected $table = 'member_activity_log';

    public $timestamps = false;

    protected $fillable = [
        'tenant_id',
        'actor_user_id',
        'target_user_id',
        'event_type',
        'metadata',
        'created_at',
    ];

    protected $casts = [
        'metadata'   => 'array',
        'created_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(fn ($m) => $m->created_at ??= now());
    }

    /**
     * Convenience factory for recording an event.
     */
    public static function record(
        string $tenantId,
        ?int $actorId,
        ?int $targetId,
        string $eventType,
        array $metadata = [],
    ): void {
        static::create([
            'tenant_id'      => $tenantId,
            'actor_user_id'  => $actorId,
            'target_user_id' => $targetId,
            'event_type'     => $eventType,
            'metadata'       => $metadata,
            'created_at'     => now(),
        ]);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }

    public function target(): BelongsTo
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }
}
