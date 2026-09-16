<?php

namespace Alamia\Core\FeatureFlags\Providers;

use Alamia\Core\FeatureFlags\Services\FeatureService;
use Illuminate\Support\ServiceProvider;

class FeatureFlagsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(FeatureService::class, fn ($app) => new FeatureService);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
    }
}
