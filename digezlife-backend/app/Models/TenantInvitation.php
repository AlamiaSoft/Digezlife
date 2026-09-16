<?php

declare(strict_types=1);

namespace App\Models;

use Alamia\Core\Tenant\Models\Tenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class TenantInvitation extends Model
{
    protected $table = 'tenant_invitations';

    protected $fillable = [
        'tenant_id',
        'email',
        'role',
        'token',
        'invited_by',
        'expires_at',
        'accepted_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'accepted_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (TenantInvitation $invitation) {
            if (empty($invitation->token)) {
                $invitation->token = Str::random(40);
            }
            if (empty($invitation->expires_at)) {
                $invitation->expires_at = now()->addDays(7);
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isAccepted(): bool
    {
        return $this->accepted_at !== null;
    }

    public function isValid(): bool
    {
        return ! $this->isAccepted() && ! $this->isExpired();
    }

    /**
     * Accept the invitation for a user and add them to the workspace.
     */
    public function accept(User $user): TenantMembership
    {
        if (! $this->isValid()) {
            throw new \DomainException('Invitation is invalid or has expired.');
        }

        /** @var Tenant $tenant */
        $tenant = $this->tenant;

        if (! $tenant->hasAvailableSeats()) {
            throw new \DomainException('Workspace seat limit has been reached.');
        }

        $membership = $tenant->addMember(
            user: $user,
            role: $this->role,
            isOwner: false,
            invitedBy: $this->inviter
        );

        $this->update([
            'accepted_at' => now(),
        ]);

        return $membership;
    }
}
