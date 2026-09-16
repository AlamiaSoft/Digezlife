<?php

namespace Alamia\Core\Platform\Providers;

use Alamia\Core\Platform\Contracts\DiscoveryProvider;
use Alamia\Core\Platform\Contracts\MarketplaceProvider;
use Alamia\Core\Platform\Discovery\DomainDiscoveryProvider;
use Alamia\Core\Platform\Discovery\ModuleDiscoveryProvider;
use Alamia\Core\Platform\Discovery\PlatformDiscoveryService;
use Alamia\Core\Platform\Lifecycle\ModuleLifecycleService;
use Alamia\Core\Platform\Marketplace\NullMarketplaceProvider;
use Alamia\Core\Platform\Services\DeveloperToolsService;
use Illuminate\Support\ServiceProvider;

class PlatformServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind Discovery Providers
        $this->app->singleton(DomainDiscoveryProvider::class);
        $this->app->singleton(ModuleDiscoveryProvider::class);
        $this->app->bind(MarketplaceProvider::class, NullMarketplaceProvider::class);

        // Tag all Discovery Providers
        $this->app->tag([
            DomainDiscoveryProvider::class,
            ModuleDiscoveryProvider::class,
            MarketplaceProvider::class,
        ], DiscoveryProvider::class);

        // Bind PlatformDiscoveryService and inject tagged providers
        $this->app->singleton(PlatformDiscoveryService::class, function ($app) {
            return new PlatformDiscoveryService($app->tagged(DiscoveryProvider::class));
        });

        // Bind other Platform Services
        $this->app->singleton(DeveloperToolsService::class);
        $this->app->singleton(ModuleLifecycleService::class);
    }
}
