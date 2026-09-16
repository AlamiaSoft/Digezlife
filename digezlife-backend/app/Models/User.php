<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Alamia\Core\Shared\Traits\HasExternalId;
use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasTenants;
use Filament\Panel;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Stancl\Tenancy\Database\Concerns\CentralConnection;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements FilamentUser, HasTenants
{
    /** @use HasFactory<UserFactory> */
    use CentralConnection, HasApiTokens, HasExternalId, HasFactory, Notifiable, \Spatie\Permission\Traits\HasRoles;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Use primary key for route model binding in Filament admin.
     * The HasExternalId trait sets this to 'external_id', but users may lack one.
     */
    public function getRouteKeyName(): string
    {
        return 'id';
    }

    /**
     * Get the tenants the user belongs to.
     */
    public function tenants()
    {
        return $this->belongsToMany(
            \Alamia\Core\Tenant\Models\Tenant::class,
            'tenant_user',
            'user_id',
            'tenant_id'
        )->using(\App\Models\TenantMembership::class)
         ->withPivot(['id', 'is_owner', 'status', 'joined_at', 'invited_by'])
         ->withTimestamps();
    }

    /**
     * Get memberships for the user.
     */
    public function tenantMemberships()
    {
        return $this->hasMany(\App\Models\TenantMembership::class, 'user_id');
    }

    /**
     * Get the role name of this user in a specific tenant.
     */
    public function getRoleInTenant(string|\Alamia\Core\Tenant\Models\Tenant $tenant): ?string
    {
        $tenantId = $tenant instanceof \Alamia\Core\Tenant\Models\Tenant ? $tenant->id : $tenant;
        setPermissionsTeamId($tenantId);

        return $this->roles()->where('roles.tenant_id', $tenantId)->first()?->name;
    }

    /**
     * Check if user has a role in a specific tenant.
     */
    public function hasRoleInTenant(string|array $roles, string|\Alamia\Core\Tenant\Models\Tenant $tenant): bool
    {
        $tenantId = $tenant instanceof \Alamia\Core\Tenant\Models\Tenant ? $tenant->id : $tenant;
        setPermissionsTeamId($tenantId);

        return $this->hasRole($roles);
    }

    /**
     * Attach user to a workspace with Spatie team-scoped role.
     */
    public function attachToTenant(string|\Alamia\Core\Tenant\Models\Tenant $tenant, string $role = 'member', bool $isOwner = false): \App\Models\TenantMembership
    {
        $tenantModel = $tenant instanceof \Alamia\Core\Tenant\Models\Tenant
            ? $tenant
            : \Alamia\Core\Tenant\Models\Tenant::findOrFail($tenant);

        return $tenantModel->addMember($this, $role, $isOwner);
    }

    public function getTenants(\Filament\Panel $panel): \Illuminate\Support\Collection | array
    {
        return $this->tenants()->wherePivot('status', 'active')->get();
    }

    public function canAccessTenant(\Illuminate\Database\Eloquent\Model $tenant): bool
    {
        return $this->tenants()
            ->where('tenants.id', $tenant->id)
            ->wherePivot('status', 'active')
            ->exists();
    }

    public function canAccessPanel(Panel $panel): bool
    {
        if ($panel->getId() === 'admin') {
            return \Alamia\Core\Authorization\Models\SuperAdmin::where('email', $this->email)
                ->where('status', 'active')
                ->exists()
                || (method_exists($this, 'hasRole') && $this->hasRole('super_admin'))
                || str_ends_with($this->email, '@alamia.io');
        }

        return true;
    }
}
