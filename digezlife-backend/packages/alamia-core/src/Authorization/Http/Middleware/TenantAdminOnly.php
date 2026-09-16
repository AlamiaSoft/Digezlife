<?php

namespace Alamia\Core\Authorization\Http\Middleware;

use Alamia\Core\Authorization\Models\SuperAdmin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantAdminOnly
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()) {
            return response()->json([
                'errors' => [
                    [
                        'status' => '401',
                        'code' => 'UNAUTHENTICATED',
                        'title' => 'Unauthenticated',
                        'detail' => 'Authentication required',
                    ],
                ],
                'jsonapi' => ['version' => '1.1'],
            ], 401);
        }

        // Check if user has admin role in the tenant
        $tenant = tenant();
        $isAdmin = $tenant && $request->user()->tenants()
            ->where('tenants.id', $tenant->id)
            ->wherePivot('role', 'admin')
            ->exists();

        // Justification: Larastan infers user as App\Models\User, but SuperAdmin authenticates via super_admin guard.
        // @phpstan-ignore-next-line
        if (! $isAdmin && ! ($request->user() instanceof SuperAdmin)) {
            return response()->json([
                'errors' => [
                    [
                        'status' => '403',
                        'code' => 'FORBIDDEN',
                        'title' => 'Forbidden',
                        'detail' => 'Tenant admin access required',
                    ],
                ],
                'jsonapi' => ['version' => '1.1'],
            ], 403);
        }

        return $next($request);
    }
}
