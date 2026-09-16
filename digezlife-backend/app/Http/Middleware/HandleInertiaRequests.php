<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $tenant = null;
        $userRole = 'admin';

        $roles = [];
        $permissions = [];
        $isOwner = false;

        if (function_exists('tenant') && tenant('id')) {
            $currency = tenant('settings.currency') ?? [
                'code' => 'PKR',
                'symbol' => '₨',
                'name' => 'Pakistani Rupee',
                'decimals' => 0,
                'symbolPosition' => 'prefix',
            ];

            $tenant = [
                'id' => tenant('id'),
                'name' => tenant('name') ?? ucfirst((string) tenant('id')),
                'plan' => tenant('plan') ?? 'enterprise',
                'currency' => $currency,
            ];

            if ($request->user()) {
                setPermissionsTeamId($tenant['id']);
                $roles = $request->user()->roles()->where('roles.tenant_id', $tenant['id'])->pluck('name')->toArray();
                if (! empty($roles)) {
                    $userRole = strtolower((string) $roles[0]);
                }

                $membership = $request->user()->tenants()->where('tenants.id', $tenant['id'])->first();
                if ($membership && isset($membership->pivot->is_owner)) {
                    $isOwner = (bool) $membership->pivot->is_owner;
                }

                $permissions = $request->user()->getAllPermissions()->pluck('name')->toArray();
            }
        }

        $activeModules = [];
        if ($tenant) {
            $activeModules = \Alamia\Core\Tenant\Models\TenantModule::where('tenant_id', $tenant['id'])
                ->where('enabled', true)
                ->pluck('module')
                ->toArray();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $userRole,
                    'roles' => $roles,
                    'permissions' => $permissions,
                    'is_owner' => $isOwner,
                ] : null,
            ],
            'tenant' => $tenant,
            'activeModules' => $activeModules,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
