<?php

namespace Amrshah\Arbac;

use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Blade;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class ArbacServiceProvider extends PackageServiceProvider
{
    public function configurePackage(Package $package): void
    {
        /*
         * This class is a Package Service Provider
         *
         * More info: https://github.com/spatie/laravel-package-tools
         */
        $package
            ->name('arbac')
            ->hasConfigFile()
            ->hasViews()
            ->hasMigration('create_arbac_table')
            ->hasMigration('create_arbac_audit_logs_table')
            ->hasMigration('create_permission_groups_table')
            ->hasCommand(Commands\ArbacCommand::class)
            ->hasCommand(Commands\MakeRuleCommand::class);
    }

    public function packageRegistered(): void
    {
        // Bind ArbacManager as singleton
        $this->app->singleton('arbac', function ($app) {
            $manager = new ArbacManager;
            $manager->loadAttributeRulesFromConfig();

            return $manager;
        });

        // Alias for easier access
        $this->app->alias('arbac', ArbacManager::class);
    }

    public function packageBooted(): void
    {
        // Register observers for automatic cache invalidation
        if (config('arbac.cache.auto_invalidate', true)) {
            \Spatie\Permission\Models\Role::observe(Observers\RoleObserver::class);
            \Spatie\Permission\Models\Permission::observe(Observers\PermissionObserver::class);
        }

        // Register middleware
        $router = $this->app->make(Router::class);
        $router->aliasMiddleware('arbac', Http\Middleware\CheckPermission::class);
        $router->aliasMiddleware('role', Http\Middleware\CheckRole::class);

        // Context-aware middleware
        $router->aliasMiddleware('arbac.context', Http\Middleware\CheckPermissionWithContext::class);
        $router->aliasMiddleware('arbac.ip', Http\Middleware\CheckIpRestricted::class);
        $router->aliasMiddleware('arbac.time', Http\Middleware\CheckTimeRestricted::class);

        // Register Blade directives
        $this->registerBladeDirectives();
    }

    protected function registerBladeDirectives(): void
    {
        // @arbac('edit post', ['post' => $post])
        Blade::directive('arbac', fn ($expression) => "<?php if(app('arbac')->check(auth()->user(), {$expression})): ?>");

        Blade::directive('endarbac', fn () => '<?php endif; ?>');

        // @hasrole('admin')
        Blade::directive('hasrole', fn ($expression) => "<?php if(auth()->check() && auth()->user()->hasRole({$expression})): ?>");

        Blade::directive('endhasrole', fn () => '<?php endif; ?>');

        // @haspermission('users.create')
        Blade::directive('haspermission', fn ($expression) => "<?php if(auth()->check() && auth()->user()->can({$expression})): ?>");

        Blade::directive('endhaspermission', fn () => '<?php endif; ?>');

        // @unlessrole('admin')
        Blade::directive('unlessrole', fn ($expression) => "<?php if(auth()->check() && !auth()->user()->hasRole({$expression})): ?>");

        Blade::directive('endunlessrole', fn () => '<?php endif; ?>');
    }
}
