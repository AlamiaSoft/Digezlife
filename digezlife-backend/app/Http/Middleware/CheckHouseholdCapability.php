<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Services\HouseholdPermissionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckHouseholdCapability
{
    public function __construct(private readonly HouseholdPermissionService $permissions) {}

    /**
     * Enforce that the authenticated user holds the given capability
     * for the current household tenant.
     *
     * Usage in routes: ->middleware('household_capability:view_hisaab')
     */
    public function handle(Request $request, Closure $next, string $capability): Response
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $tenantId = $request->route('tenant')
            ?? $request->header('X-Tenant-ID')
            ?? $request->query('household_id');

        if (!$tenantId) {
            return response()->json(['message' => 'Household context required.'], 422);
        }

        if (!$this->permissions->hasCapability($tenantId, $user->id, $capability)) {
            return response()->json(['message' => 'You do not have permission to perform this action.'], 403);
        }

        return $next($request);
    }
}
