<?php

namespace Alamia\Core\Quota\Providers;

use Alamia\Core\Quota\Services\QuotaService;
use Illuminate\Support\ServiceProvider;

class QuotaServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(QuotaService::class, fn ($app) => new QuotaService);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
    }
}
