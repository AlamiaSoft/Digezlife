<?php

namespace Alamia\Core\Kernel\Providers;

use Alamia\Core\Authorization\Commands\CreateSuperAdminCommand;
use Alamia\Core\Kernel\Commands\GenerateSwaggerCommand;
use Alamia\Core\Kernel\Commands\InstallCommand;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AlamiaCoreServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Merge config
        $this->mergeConfigFrom(
            dirname(__DIR__, 3).'/config/tenant-engine.php',
            'tenant-engine'
        );

        // Dynamically bind Stancl Tenancy's model config to our configured tenant model
        config(['tenancy.tenant_model' => config('tenant-engine.models.tenant')]);
        
        // Disable asset helper overriding so central assets like Filament load correctly
        config(['tenancy.asset_helper_tenancy' => false]);
        
        // Register Platform Domain
        $this->app->register(\Alamia\Core\Platform\Providers\PlatformServiceProvider::class);

        // Register Experience Engine
        $this->app->register(\Alamia\Core\Kernel\Providers\ExperienceServiceProvider::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Publish config
        $this->publishes([
            dirname(__DIR__, 3).'/config/tenant-engine.php' => config_path('tenant-engine.php'),
        ], 'tenant-engine-config');

        // Publish central migrations
        $this->publishes([
            dirname(__DIR__, 3).'/src/Database/Migrations/central' => database_path('migrations/central'),
        ], 'tenant-engine-migrations-central');

        // Publish tenant migrations
        $this->publishes([
            dirname(__DIR__, 3).'/src/Database/Migrations/tenant' => database_path('migrations/tenant'),
        ], 'tenant-engine-migrations-tenant');

        // Load migrations (for package development)
        $this->loadMigrationsFrom(dirname(__DIR__, 3).'/src/Database/Migrations/central');

        // Register routes
        $this->registerRoutes();

        // Commands available in both console and web (for Developer Center)
        $this->commands([
            \Alamia\Core\Kernel\Commands\DoctorCommand::class,
            \Alamia\Core\Kernel\Commands\MakeModuleCommand::class,
            \Alamia\Core\Kernel\Commands\ValidateModuleCommand::class,
        ]);

        // Register remaining commands for CLI only
        if ($this->app->runningInConsole()) {
            $this->commands([
                InstallCommand::class,
                CreateSuperAdminCommand::class,
                GenerateSwaggerCommand::class,
                \Alamia\Core\Administration\Commands\MakeTenantCommand::class,
                \Alamia\Core\Kernel\Commands\MakeDomainArtifactCommand::class,
                \Alamia\Core\Kernel\Commands\ContextCommand::class,
                \Alamia\Core\Kernel\Commands\PublishStubsCommand::class,
                \Alamia\Core\Kernel\Commands\DependencyGraphCommand::class,
                \Alamia\Core\Kernel\Commands\ModuleBrowserCommand::class,
                \Alamia\Core\Kernel\Commands\ReleaseCommand::class,
                \Alamia\Core\Kernel\Commands\UpgradeCheckCommand::class,
                \Alamia\Core\Kernel\Commands\MarketplaceCommand::class,
            ]);
        }

        // Register middleware
        $this->registerMiddleware();
    }

    /**
     * Register routes.
     */
    protected function registerRoutes(): void
    {
        if (! config('tenant-engine.enabled', true)) {
            return;
        }

        // Super Admin routes
        Route::middleware(['api', 'api.version'])
            ->prefix('api/v1/super-admin')
            ->group(__DIR__.'/../../Authorization/Routes/super-admin.php');

        // Central API routes (authentication, tenant selection)
        Route::middleware(['api', 'api.version'])
            ->prefix('api/v1')
            ->group(__DIR__.'/../Routes/api.php');

        // Tenant-scoped routes
        Route::middleware(['api', 'api.version'])
            ->prefix('{tenant}/api/v1')
            ->group(__DIR__.'/../../Tenant/Routes/tenant.php');
    }

    /**
     * Register middleware.
     */
    protected function registerMiddleware(): void
    {
        $router = $this->app['router'];

        // Register middleware aliases
        $middlewareAliases = config('tenant-engine.middleware', []);

        foreach ($middlewareAliases as $alias => $class) {
            if (class_exists($class)) {
                $router->aliasMiddleware($alias, $class);
            }
        }
    }
}
