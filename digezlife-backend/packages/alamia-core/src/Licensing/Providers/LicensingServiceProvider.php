<?php

namespace Alamia\Core\Licensing\Providers;

use Alamia\Core\Licensing\Services\LicensingService;
use Illuminate\Support\ServiceProvider;

class LicensingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(LicensingService::class, fn ($app) => new LicensingService);
    }

    public function boot(): void
    {
        //
    }
}
