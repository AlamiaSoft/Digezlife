<?php

declare(strict_types=1);

namespace App\Models;

use Alamia\Core\Tenant\Models\Tenant;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Spatie\Permission\Models\Role;

class TenantMembership extends Pivot
{
    protected $table = 'tenant_user';

    public $incrementing = true;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'is_owner',
        'status',
        'joined_at',
        'invited_by',
    ];

    protected $casts = [
        'is_owner' => 'boolean',
        'joined_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isOwner(): bool
    {
        return (bool) $this->is_owner;
    }

    /**
     * Get the Spatie role for this membership in this tenant.
     */
    public function getRole(): ?string
    {
        setPermissionsTeamId($this->tenant_id);

        return $this->user?->roles?->first()?->name;
    }

    /**
     * Accessor for backward compatibility with code referencing $pivot->role.
     */
    public function getRoleAttribute(): ?string
    {
        setPermissionsTeamId($this->tenant_id);
        $roleName = $this->user?->roles?->first()?->name;

        return $roleName ?? ($this->attributes['role'] ?? 'member');
    }
}
