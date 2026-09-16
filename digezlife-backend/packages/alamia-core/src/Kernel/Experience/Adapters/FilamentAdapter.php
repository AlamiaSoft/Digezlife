<?php

namespace Alamia\Core\Kernel\Experience\Adapters;

use Alamia\Core\Kernel\Experience\Facades\Experience;
use Alamia\Core\Kernel\Experience\DTOs\NavigationItem;
use Filament\Navigation\NavigationItem as FilamentNavigationItem;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class FilamentAdapter
{
    /**
     * Get mapped Filament navigation items for the given scope.
     *
     * @return array<FilamentNavigationItem>
     */
    public static function getNavigationItems(string $scope): array
    {
        $platformItems = Experience::navigation()->forScope($scope);
        $filamentItems = [];

        // Sort items by priority (higher priority first)
        usort($platformItems, fn($a, $b) => $b->getPriority() <=> $a->getPriority());

        foreach ($platformItems as $item) {
            /** @var NavigationItem $item */
            if (!static::evaluatesConditions($item)) {
                continue;
            }

            $route = $item->getRoute();
            $url = $item->getUrl();

            $filamentItem = FilamentNavigationItem::make($item->getId())
                ->label($item->getLabel());

            if ($route) {
                $filamentItem->url(function () use ($route) {
                    $tenant = filament()->getTenant() ?: request()->route('tenant');
                    $params = [];
                    if ($tenant) {
                        $params['tenant'] = is_object($tenant) ? $tenant->id : $tenant;
                    }
                    return route($route, $params);
                });
            } else {
                $filamentItem->url($url ?: '#');
            }

            if ($item->getIcon()) {
                $filamentItem->icon($item->getIcon());
            }

            if ($item->getGroup()) {
                $filamentItem->group($item->getGroup());
            }

            if ($item->getBadge()) {
                $filamentItem->badge($item->getBadge(), $item->getBadgeColor());
            }

            $filamentItems[] = $filamentItem;
        }

        return $filamentItems;
    }

    /**
     * Get resolved page class list for the given scope.
     *
     * @return array<string>
     */
    public static function getPages(string $scope): array
    {
        $platformPages = Experience::pages()->forScope($scope);
        $classes = [];

        foreach ($platformPages as $page) {
            if (!static::evaluatesConditions($page)) {
                continue;
            }
            $classes[] = $page->getClass();
        }

        return $classes;
    }

    /**
     * Get resolved resource class list for the given scope.
     *
     * @return array<string>
     */
    public static function getResources(string $scope): array
    {
        $platformResources = Experience::resources()->forScope($scope);
        $classes = [];

        foreach ($platformResources as $resource) {
            if (!static::evaluatesConditions($resource)) {
                continue;
            }
            $classes[] = $resource->getClass();
        }

        return $classes;
    }

    /**
     * Get resolved widget class list for the given scope.
     *
     * @return array<string>
     */
    public static function getWidgets(string $scope): array
    {
        $platformWidgets = Experience::widgets()->forScope($scope);
        $classes = [];

        foreach ($platformWidgets as $widget) {
            if (!static::evaluatesConditions($widget)) {
                continue;
            }
            $classes[] = $widget->getClass();
        }

        return $classes;
    }

    /**
     * Evaluate visibility, plan subscription, and authorization conditions.
     */
    protected static function evaluatesConditions(object $item): bool
    {
        // 1. Visible check
        $visible = $item->getVisible();
        if (is_callable($visible)) {
            if (!call_user_func($visible)) {
                return false;
            }
        } elseif (!$visible) {
            return false;
        }

        // 2. Permission check
        $permissions = $item->getPermissions();
        if (!empty($permissions)) {
            $user = auth()->user();
            if (!$user) {
                return false;
            }
            foreach ($permissions as $permission) {
                if (!$user->can($permission)) {
                    return false;
                }
            }
        }

        // 3. Feature check
        $features = $item->getFeatures();
        if (!empty($features)) {
            foreach ($features as $feature) {
                if (!static::isFeatureEnabledForTenant($feature)) {
                    return false;
                }
            }
        }

        // 4. Plan check
        $plans = $item->getPlans();
        if (!empty($plans)) {
            if (!static::isPlanActiveForTenant($plans)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if a workspace feature is enabled for the current tenant or active globally.
     */
    protected static function isFeatureEnabledForTenant(string $feature): bool
    {
        $tenantId = null;
        if (function_exists('tenant') && tenant('id')) {
            $tenantId = tenant('id');
        } else {
            // Fallback for early panel registration phase
            if (request()->segment(1) === 'app') {
                $tenantId = request()->segment(2);
            }
        }

        if ($tenantId) {
            $centralConnection = config('tenancy.central_connection', 'sqlite');

            // Fallback check if DB migrations haven't run yet
            if (Schema::connection($centralConnection)->hasTable('tenant_modules')) {
                $enabled = DB::connection($centralConnection)->table('tenant_modules')
                    ->where('tenant_id', $tenantId)
                    ->where('module', $feature)
                    ->where('enabled', true)
                    ->exists();

                return $enabled;
            }
        }

        // central fallback: check if module is enabled globally
        if (class_exists(\Nwidart\Modules\Facades\Module::class)) {
            $module = \Nwidart\Modules\Facades\Module::find($feature);
            return $module && $module->isEnabled();
        }

        return true;
    }

    /**
     * Check if the tenant is subscribed to the required plans.
     */
    protected static function isPlanActiveForTenant(array $plans): bool
    {
        if (function_exists('tenant') && tenant('id')) {
            $plan = tenant('plan');
            if ($plan) {
                return in_array($plan, $plans);
            }
        }

        return true;
    }
}
