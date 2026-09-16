<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class InitializeTenancyForFilament
{
    public function handle(Request $request, Closure $next)
    {
        if (function_exists('tenancy') && filament()->getTenant()) {
            $tenant = filament()->getTenant();
            if (!tenancy()->initialized || tenancy()->tenant->id !== $tenant->id) {
                tenancy()->initialize($tenant);
            }
        }

        return $next($request);
    }
}
