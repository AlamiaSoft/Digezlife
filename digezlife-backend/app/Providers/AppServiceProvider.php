<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\App\Services\HouseholdPermissionService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // 0. Force HTTPS URL generation behind reverse proxies (Cloudflare Tunnel)
        if (str_starts_with(config('app.url', ''), 'https://') || app()->isProduction()) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        // 1. Strict Auth Throttling (6 attempts/minute per IP)
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(6)->by($request->ip())->response(function () {
                return response()->json([
                    'errors' => [
                        [
                            'status' => '429',
                            'title' => 'Too Many Attempts',
                            'detail' => 'Too many authentication attempts. Please wait a minute before retrying.',
                        ],
                    ],
                    'jsonapi' => ['version' => '1.1'],
                ], 429);
            });
        });

        // 2. Standard API Throttling (60 requests/minute per authenticated user or IP)
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // 3. SuperAdmin Throttling (5 attempts/minute per IP)
        RateLimiter::for('admin', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });
    }
}
