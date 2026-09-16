<?php

namespace Alamia\Core\Tenant\Http\Middleware;

use Alamia\Core\Authorization\Models\SuperAdmin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserBelongsToTenant
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = tenant();
        $user = $request->user();

        if (! $tenant || ! $user) {
            if (! $request->expectsJson()) {
                return redirect()->guest('/login');
            }

            return response()->json([
                'errors' => [
                    [
                        'status' => '401',
                        'code' => 'UNAUTHORIZED',
                        'title' => 'Unauthorized',
                        'detail' => 'You must be authenticated to access this resource.',
                    ],
                ],
                'jsonapi' => ['version' => '1.1'],
            ], 401);
        }

        // Super admins can access any tenant
        // Justification: Larastan infers user as App\Models\User, but SuperAdmin authenticates via super_admin guard.
        // @phpstan-ignore-next-line
        if ($user instanceof SuperAdmin) {
            if (function_exists('setPermissionsTeamId')) {
                setPermissionsTeamId($tenant->id);
            }

            return $next($request);
        }

        // Check if the user has active membership in current tenant
        $belongsToTenant = $user->tenants()
            ->where('tenants.id', $tenant->id)
            ->wherePivot('status', 'active')
            ->exists();

        if (! $belongsToTenant) {
            if (! $request->expectsJson()) {
                abort(403, 'You do not have access to this tenant.');
            }

            return response()->json([
                'errors' => [
                    [
                        'status' => '403',
                        'code' => 'FORBIDDEN',
                        'title' => 'Forbidden',
                        'detail' => 'You do not have active access to this tenant.',
                    ],
                ],
                'jsonapi' => ['version' => '1.1'],
            ], 403);
        }

        if (function_exists('setPermissionsTeamId')) {
            setPermissionsTeamId($tenant->id);
        }

        return $next($request);
    }
}
