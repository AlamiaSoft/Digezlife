<?php

namespace Alamia\Core\Integrations\Providers;

use Alamia\Core\Integrations\Services\Webhooks\WebhookManager;
use Illuminate\Support\ServiceProvider;

class IntegrationsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(WebhookManager::class, fn ($app) => new WebhookManager);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
    }
}
