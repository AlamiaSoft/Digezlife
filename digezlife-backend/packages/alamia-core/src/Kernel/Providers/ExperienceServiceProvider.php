<?php

namespace Alamia\Core\Kernel\Providers;

use Alamia\Core\Kernel\Experience\ExperienceEngine;
use Alamia\Core\Kernel\Experience\Registries\NavigationRegistry;
use Alamia\Core\Kernel\Experience\Registries\WidgetRegistry;
use Alamia\Core\Kernel\Experience\Registries\LayoutRegistry;
use Alamia\Core\Kernel\Experience\Registries\SettingsRegistry;
use Alamia\Core\Kernel\Experience\Registries\PageRegistry;
use Alamia\Core\Kernel\Experience\Registries\ResourceRegistry;
use Alamia\Core\Kernel\Experience\Registries\CommandRegistry;
use Alamia\Core\Kernel\Experience\Registries\SearchRegistry;
use Alamia\Core\Kernel\Experience\Facades\Experience;
use Alamia\Core\Kernel\Experience\DTOs\PageDefinition;
use Alamia\Core\Kernel\Experience\DTOs\ResourceDefinition;
use Illuminate\Support\ServiceProvider;

class ExperienceServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(NavigationRegistry::class);
        $this->app->singleton(WidgetRegistry::class);
        $this->app->singleton(LayoutRegistry::class);
        $this->app->singleton(SettingsRegistry::class);
        $this->app->singleton(PageRegistry::class);
        $this->app->singleton(ResourceRegistry::class);
        $this->app->singleton(CommandRegistry::class);
        $this->app->singleton(SearchRegistry::class);

        $this->app->singleton(ExperienceEngine::class, function ($app) {
            $engine = new ExperienceEngine(
                $app->make(NavigationRegistry::class),
                $app->make(WidgetRegistry::class),
                $app->make(LayoutRegistry::class),
                $app->make(SettingsRegistry::class),
                $app->make(PageRegistry::class),
                $app->make(ResourceRegistry::class),
                $app->make(CommandRegistry::class),
                $app->make(SearchRegistry::class)
            );

            foreach (config('experience.contributions', []) as $contribution) {
                $engine->registerContribution($contribution);
            }

            return $engine;
        });

        $this->app->alias(ExperienceEngine::class, 'experience');
    }

    public function boot(): void
    {
        // Core pages
        Experience::pages()->tenant()->add(
            PageDefinition::make('workspace-settings', \App\Filament\Tenant\Pages\Workspace\WorkspaceSettings::class)
        );
        Experience::pages()->tenant()->add(
            PageDefinition::make('custom-domains', \App\Filament\Tenant\Pages\Workspace\CustomDomainsPage::class)
        );
        Experience::pages()->tenant()->add(
            PageDefinition::make('workspace-features', \App\Filament\Tenant\Pages\WorkspaceFeaturesPage::class)
        );

        // Core resources
        Experience::resources()->tenant()->add(
            ResourceDefinition::make('users-resource', \App\Filament\Tenant\Resources\Identity\UsersResource::class)
        );

    }
}
