<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\HouseholdPermission;
use App\Models\TenantMembership;
use Illuminate\Support\Facades\Cache;

class HouseholdPermissionService
{
    /**
     * Check if a user has a specific capability in a tenant.
     * Owners always pass — no DB lookup required beyond the membership.
     */
    public function hasCapability(string $tenantId, int $userId, string $capability): bool
    {
        $membership = TenantMembership::where('tenant_id', $tenantId)
            ->where('user_id', $userId)
            ->where('status', 'active')
            ->first();

        if (!$membership) {
            return false;
        }

        if ($membership->is_owner) {
            return true;
        }

        return Cache::remember(
            "hperm:{$tenantId}:{$userId}:{$capability}",
            60,
            fn () => HouseholdPermission::where('tenant_id', $tenantId)
                ->where('user_id', $userId)
                ->where('capability', $capability)
                ->where('enabled', true)
                ->exists()
        );
    }

    /**
     * Replace a user's full capability set for a tenant.
     * Invalid capability strings are silently ignored.
     */
    public function syncCapabilities(string $tenantId, int $userId, array $capabilities): void
    {
        HouseholdPermission::where('tenant_id', $tenantId)
            ->where('user_id', $userId)
            ->delete();

        foreach ($capabilities as $capability) {
            if (in_array($capability, HouseholdPermission::allCapabilities(), true)) {
                HouseholdPermission::create([
                    'tenant_id'  => $tenantId,
                    'user_id'    => $userId,
                    'capability' => $capability,
                    'enabled'    => true,
                ]);
            }
        }

        // Clear individual cache keys for every capability.
        // Using Cache::forget (not tags) so this works with file/SQLite/database drivers.
        foreach (HouseholdPermission::allCapabilities() as $cap) {
            Cache::forget("hperm:{$tenantId}:{$userId}:{$cap}");
        }
    }

    /**
     * Return all enabled capabilities for a user in a tenant.
     * Owners receive the full capability list without a DB read.
     */
    public function getCapabilities(string $tenantId, int $userId): array
    {
        $membership = TenantMembership::where('tenant_id', $tenantId)
            ->where('user_id', $userId)
            ->first();

        if ($membership?->is_owner) {
            return HouseholdPermission::allCapabilities();
        }

        return HouseholdPermission::where('tenant_id', $tenantId)
            ->where('user_id', $userId)
            ->where('enabled', true)
            ->pluck('capability')
            ->all();
    }
}
