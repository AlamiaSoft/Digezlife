<?php

declare(strict_types=1);

namespace Alamia\Core\Tenant\Providers;

use Alamia\Core\Tenant\Commands\TenantCreateCommand;
use Alamia\Core\Tenant\Commands\TenantMigrateCommand;
use Alamia\Core\Tenant\Contracts\TenantDatabaseProvisioner;
use Alamia\Core\Tenant\Events\TenantRegistered;
use Alamia\Core\Tenant\Infrastructure\SharedConnectionProvisioner;
use Alamia\Core\Tenant\Listeners\ProvisionTenantListener;
use Alamia\Core\Platform\Contracts\DomainDefinition;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Stancl\JobPipeline\JobPipeline;
use Stancl\Tenancy\Events;
use Stancl\Tenancy\Listeners;
use Stancl\Tenancy\Middleware;
use Stancl\Tenancy\Resolvers\DomainTenantResolver;
use Stancl\Tenancy\TenancyServiceProvider as BaseTenancyServiceProvider;

class TenancyServiceProvider extends BaseTenancyServiceProvider implements DomainDefinition
{
    // By default, no namespace is used to support the callable array syntax.
    public static string $controllerNamespace = '';

    public function events()
    {
        return [
            // Tenant events
            Events\CreatingTenant::class => [],
            // stancl's TenantCreated is still fired internally by Tenant::create(),
            // but our provisioning pipeline is anchored to Alamia's own TenantRegistered
            // event (fired by TenantProvisioningService). stancl is an implementation detail.
            Events\TenantCreated::class => [],
            Events\SavingTenant::class => [],
            Events\TenantSaved::class => [],
            Events\UpdatingTenant::class => [],
            Events\TenantUpdated::class => [],
            Events\DeletingTenant::class => [],
            Events\TenantDeleted::class => [],

            // Domain events
            Events\CreatingDomain::class => [],
            Events\DomainCreated::class => [],
            Events\SavingDomain::class => [],
            Events\DomainSaved::class => [],
            Events\UpdatingDomain::class => [],
            Events\DomainUpdated::class => [],
            Events\DeletingDomain::class => [],
            Events\DomainDeleted::class => [],

            // Database events
            Events\DatabaseCreated::class => [],
            Events\DatabaseMigrated::class => [],
            Events\DatabaseSeeded::class => [],
            Events\DatabaseRolledBack::class => [],
            Events\DatabaseDeleted::class => [],

            // Tenancy events
            Events\InitializingTenancy::class => [],
            Events\TenancyInitialized::class => [
                Listeners\BootstrapTenancy::class,
            ],

            Events\EndingTenancy::class => [],
            Events\TenancyEnded::class => [
                Listeners\RevertToCentralContext::class,
            ],

            Events\BootstrappingTenancy::class => [],
            Events\TenancyBootstrapped::class => [],
            Events\RevertingToCentralContext::class => [],
            Events\RevertedToCentralContext::class => [],

            // Resource syncing
            Events\SyncedResourceSaved::class => [
                Listeners\UpdateSyncedResource::class,
            ],

            // Fired only when a synced resource is changed in a different DB than the origin DB (to avoid infinite loops)
            Events\SyncedResourceChangedInForeignDatabase::class => [],
        ];
    }

    public function register(): void
    {
        // Bind the database provisioner contract to the shared connection
        // implementation by default. Override this binding to switch to
        // dedicated-database tenancy without changing any other code.
        $this->app->bind(
            TenantDatabaseProvisioner::class,
            SharedConnectionProvisioner::class,
        );
    }

    public function boot(): void
    {
        $this->bootCommands();

        $this->bootEvents();

        // Register Alamia's provisioning listener on Alamia's own TenantRegistered event.
        // This decouples the provisioning pipeline from stancl/tenancy's lifecycle.
        Event::listen(TenantRegistered::class, ProvisionTenantListener::class);

        // Removed mapRoutes() as AlamiaCore handles routes via its own mechanism or routes/tenant.php if verified.
        // For now, let's keep it minimal or delegate to AlamiaCoreServiceProvider logic.
        // But Stancl expects mapRoutes() if using routes/tenant.php.
        // Let's rely on AlamiaCore's route registration for now or uncomment if needed.
        $this->mapRoutes();

        $this->makeTenancyMiddlewareHighestPriority();
    }

    protected function bootCommands(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                TenantCreateCommand::class,
                TenantMigrateCommand::class,
            ]);
        }
    }

    protected function bootEvents()
    {
        foreach ($this->events() as $event => $listeners) {
            foreach ($listeners as $listener) {
                if ($listener instanceof JobPipeline) {
                    $listener = $listener->toListener();
                }

                Event::listen($event, $listener);
            }
        }
    }

    protected function mapRoutes()
    {
        // Check if main app has routes/tenant.php, otherwise we might provide default via package
        if (file_exists(base_path('routes/tenant.php'))) {
            $this->app->booted(function () {
                Route::namespace(static::$controllerNamespace)
                    ->group(base_path('routes/tenant.php'));
            });
        }
    }

    protected function makeTenancyMiddlewareHighestPriority()
    {
        $tenancyMiddleware = [
            // Even higher priority than the initialization middleware
            Middleware\PreventAccessFromCentralDomains::class,

            Middleware\InitializeTenancyByDomain::class,
            Middleware\InitializeTenancyBySubdomain::class,
            Middleware\InitializeTenancyByDomainOrSubdomain::class,
            Middleware\InitializeTenancyByPath::class,
            Middleware\InitializeTenancyByRequestData::class,
        ];

        foreach (array_reverse($tenancyMiddleware) as $middleware) {
            $this->app[Kernel::class]->prependToMiddlewarePriority($middleware);
        }
    }

    public function name(): string
    {
        return 'Tenant';
    }

    public function description(): string
    {
        return 'Multi-tenant isolation, provisioning, domain management, and tenant switching.';
    }

    public function capabilities(): array
    {
        return ['isolation', 'provisioning', 'domains'];
    }

    public function version(): string
    {
        return '1.0.0';
    }
}
