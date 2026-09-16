<?php

namespace Alamia\Core\UsageMeter\Providers;

use Alamia\Core\UsageMeter\Services\UsageMeterService;
use Illuminate\Support\ServiceProvider;

class UsageMeterServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(UsageMeterService::class, fn ($app) => new UsageMeterService);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
    }
}
