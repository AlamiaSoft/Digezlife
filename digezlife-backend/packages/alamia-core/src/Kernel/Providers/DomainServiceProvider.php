<?php

namespace Alamia\Core\Kernel\Providers;

use Alamia\Core\Kernel\Modules\FilesystemLoader;
use Alamia\Core\Kernel\Modules\ModuleRegistry;
use Exception;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

class DomainServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->registerDomainProviders();
        $this->registerExternalModules();
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Automatically discover and register service providers from all domains.
     */
    protected function registerDomainProviders(): void
    {
        $srcPath = __DIR__.'/../../';

        if (! File::exists($srcPath)) {
            return;
        }

        $domains = File::directories($srcPath);

        foreach ($domains as $domainPath) {
            $domainName = basename($domainPath);

            // Skip Kernel itself to avoid infinite loops if we loaded everything
            // (though we can explicitly load others)
            if ($domainName === 'Kernel') {
                continue;
            }

            $providerDir = $domainPath.'/Providers';

            if (File::exists($providerDir)) {
                $files = File::files($providerDir);
                foreach ($files as $file) {
                    $class = "Alamia\\Core\\{$domainName}\\Providers\\".$file->getFilenameWithoutExtension();
                    if (class_exists($class)) {
                        $this->app->register($class);
                    }
                }
            }
        }
    }

    /**
     * Load external business modules using the ModuleRegistry and FilesystemLoader.
     */
    protected function registerExternalModules(): void
    {
        $this->app->singleton(ModuleRegistry::class, fn () => new ModuleRegistry);

        $registry = $this->app->make(ModuleRegistry::class);
        $loader = new FilesystemLoader(base_path('modules'));

        try {
            $loader->load($registry);

            foreach ($registry->sorted() as $module) {
                foreach ($module->providers as $provider) {
                    if (class_exists($provider)) {
                        $this->app->register($provider);
                    }
                }
            }
        } catch (Exception $e) {
            Log::error('Alamia Module Loading Failed: '.$e->getMessage());
        }
    }
}
