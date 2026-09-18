<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HouseholdPermission extends Model
{
    protected $table = 'household_permissions';

    protected $fillable = ['tenant_id', 'user_id', 'capability', 'enabled'];

    protected $casts = ['enabled' => 'boolean'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * All supported capabilities.
     */
    public static function allCapabilities(): array
    {
        return [
            'view_household',
            'view_family_activity',
            'view_sauda',
            'manage_sauda',
            'view_hisaab',
            'create_expense',
            'edit_own_expense',
            'view_financial_totals',
            'view_bills',
            'manage_bills',
            'view_reminders',
            'manage_reminders',
            'manage_members',
            'manage_permissions',
        ];
    }

    /**
     * Default capabilities granted by role.
     */
    public static function defaultsForRole(string $role): array
    {
        return match ($role) {
            'owner', 'admin' => self::allCapabilities(),
            'manager'        => [
                'view_household',
                'view_family_activity',
                'view_sauda',
                'manage_sauda',
                'view_hisaab',
                'create_expense',
                'edit_own_expense',
                'view_bills',
                'view_reminders',
                'manage_reminders',
            ],
            'viewer' => ['view_household', 'view_sauda', 'view_reminders'],
            default  => ['view_household', 'view_sauda'],
        };
    }
}
