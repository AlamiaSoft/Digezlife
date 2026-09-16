<?php

namespace Alamia\Core\Audit\Providers;

use Alamia\Core\Audit\Services\AuditService;
use Illuminate\Support\ServiceProvider;

class AuditServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(AuditService::class, fn ($app) => new AuditService);
    }

    public function boot(): void
    {
        // Activitylog migrations are already published to the main app database
    }
}
