<?php

namespace Alamia\Core\Configuration\Providers;

use Alamia\Core\Configuration\Services\ConfigurationService;
use Illuminate\Support\ServiceProvider;

class ConfigurationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ConfigurationService::class, fn ($app) => new ConfigurationService);
    }

    public function boot(): void
    {
        //
    }
}
