<?php

namespace Alamia\Core\Journeys\Providers;

use Alamia\Core\Journeys\Services\JourneyManager;
use Illuminate\Support\ServiceProvider;

class JourneysServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(JourneyManager::class, fn ($app) => new JourneyManager);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
    }
}
