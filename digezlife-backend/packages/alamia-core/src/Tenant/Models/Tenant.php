<?php

namespace Alamia\Core\Tenant\Models;

use Alamia\Core\Shared\Traits\HasExternalId;
use Alamia\Core\Shared\Traits\OptimizesQueries;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Models\Domain;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

/**
 * @property string $id
 * @property string|null $external_id
 * @property string|null $name
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $plan
 * @property string|null $status
 * @property Carbon|null $trial_ends_at
 * @property Carbon|null $subscription_ends_at
 * @property array|null $settings
 * @property array|null $data
 * @property-read Collection<int, Domain> $domains
 * @property-read int|null $domains_count
 * @property-read Collection<int, User> $users
 * @property-read int|null $users_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tenant active()
 * @method static \Stancl\Tenancy\Database\TenantCollection<int, static> all($columns = ['*'])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tenant byExternalId(string $externalId)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tenant byPlan(string $plan)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tenant cancelled()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tenant filterBy(array $filters)
 * @method static \Stancl\Tenancy\Database\TenantCollection<int, static> get($columns = ['*'])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tenant newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tenant newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tenant onTrial()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tenant onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tenant optimized()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tenant query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tenant sortBy(?string $sortBy = null, string $direction = 'asc')
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tenant suspended()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tenant withRequestedIncludes(?string $includes = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tenant withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tenant withoutTrashed()
 *
 * @mixin \Eloquent
 */
class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains, HasExternalId, OptimizesQueries, SoftDeletes;

    /**
     * Allowed includes for eager loading.
     */
    protected array $allowedIncludes = ['domains', 'users'];

    /**
     * Allowed sort fields.
     */
    protected array $allowedSorts = ['name', 'email', 'created_at', 'status', 'plan'];

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'external_id',
        'id', // This is the slug
        'name',
        'email',
        'phone',
        'plan',
        'status',
        'max_seats',
        'trial_ends_at',
        'subscription_ends_at',
        'settings',
        'data',
        'activity_feed_cleared_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'max_seats' => 'integer',
        'trial_ends_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
        'settings' => 'array',
        'data' => 'array',
    ];

    /**
     * Get custom columns for Stancl.
     */
    public static function getCustomColumns(): array
    {
        return [
            'id',
            'external_id',
            'name',
            'email',
            'phone',
            'plan',
            'status',
            'max_seats',
            'trial_ends_at',
            'subscription_ends_at',
            'settings',
            'data',
        ];
    }

    /**
     * Get the external ID prefix.
     */
    protected static function getExternalIdPrefix(): string
    {
        return config('tenant-engine.external_id_prefixes.tenants', 'TNT');
    }

    /**
     * Check if tenant is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if tenant is suspended.
     */
    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    /**
     * Check if tenant is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if tenant is on trial.
     */
    public function isOnTrial(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    /**
     * Check if trial has ended.
     */
    public function trialHasEnded(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isPast();
    }

    /**
     * Check if subscription is active.
     */
    public function hasActiveSubscription(): bool
    {
        return $this->subscription_ends_at && $this->subscription_ends_at->isFuture();
    }

    /**
     * Suspend the tenant.
     */
    public function suspend(): bool
    {
        return $this->update(['status' => 'suspended']);
    }

    /**
     * Activate the tenant.
     */
    public function activate(): bool
    {
        return $this->update(['status' => 'active']);
    }

    /**
     * Cancel the tenant.
     */
    public function cancel(): bool
    {
        return $this->update(['status' => 'cancelled']);
    }

    /**
     * Get users belonging to this tenant.
     */
    public function users()
    {
        return $this->belongsToMany(
            config('tenant-engine.models.user', \App\Models\User::class),
            'tenant_user',
            'tenant_id',
            'user_id'
        )->using(\App\Models\TenantMembership::class)
         ->withPivot(['id', 'is_owner', 'status', 'joined_at', 'invited_by'])
         ->withTimestamps();
    }

    /**
     * Get tenant memberships.
     */
    public function memberships()
    {
        return $this->hasMany(\App\Models\TenantMembership::class, 'tenant_id');
    }

    /**
     * Get invitations sent for this tenant.
     */
    public function invitations()
    {
        return $this->hasMany(\App\Models\TenantInvitation::class, 'tenant_id');
    }

    /**
     * Get the workspace owner.
     */
    public function owner()
    {
        return $this->users()->wherePivot('is_owner', true)->first();
    }

    /**
     * Count active workspace members.
     */
    public function activeMembersCount(): int
    {
        return $this->users()->wherePivot('status', 'active')->count();
    }

    /**
     * Check if workspace has available seats.
     */
    public function hasAvailableSeats(): bool
    {
        return $this->activeMembersCount() < ($this->max_seats ?? 10);
    }

    /**
     * Add a member to the workspace with a Spatie team-scoped role.
     */
    public function addMember(User $user, string $role = 'member', bool $isOwner = false, ?User $invitedBy = null): \App\Models\TenantMembership
    {
        if (! $this->hasAvailableSeats() && ! $this->users()->where('users.id', $user->id)->exists()) {
            throw new \DomainException('Workspace maximum seat limit reached.');
        }

        $membership = \App\Models\TenantMembership::updateOrCreate(
            ['tenant_id' => $this->id, 'user_id' => $user->id],
            [
                'is_owner' => $isOwner,
                'status' => 'active',
                'joined_at' => now(),
                'invited_by' => $invitedBy?->id,
            ]
        );

        setPermissionsTeamId($this->id);
        $roleModel = \Spatie\Permission\Models\Role::firstOrCreate([
            'name' => $role,
            'guard_name' => 'web',
            'tenant_id' => $this->id,
        ]);

        $user->syncRoles([$roleModel]);

        return $membership;
    }

    /**
     * Remove a member from the workspace and clear their workspace roles.
     */
    public function removeMember(User $user): void
    {
        setPermissionsTeamId($this->id);
        $user->syncRoles([]);

        $this->users()->detach($user->id);
    }

    /**
     * Scope to active tenants.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to suspended tenants.
     */
    public function scopeSuspended($query)
    {
        return $query->where('status', 'suspended');
    }

    /**
     * Scope to cancelled tenants.
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Scope to tenants on trial.
     */
    public function scopeOnTrial($query)
    {
        return $query->whereNotNull('trial_ends_at')
            ->where('trial_ends_at', '>', now());
    }

    /**
     * Scope to tenants by plan.
     */
    public function scopeByPlan($query, string $plan)
    {
        return $query->where('plan', $plan);
    }
}
