<?php

namespace App\Filament\Tenant\Pages;

use Filament\Pages\Page;
use Alamia\Core\Platform\Discovery\PlatformDiscoveryService;
use Alamia\Core\Tenant\Models\TenantModule;
use Filament\Notifications\Notification;
use Illuminate\Support\Collection;

class WorkspaceFeaturesPage extends Page
{
    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-puzzle-piece';
    protected static ?string $title = 'Workspace Features';
    protected static \UnitEnum|string|null $navigationGroup = 'Workspace';
    protected static ?string $navigationLabel = 'Features';
    protected static ?string $slug = 'features';

    protected string $view = 'filament.tenant.pages.workspace-features-page';

    public array $enabledFeatures = [];

    public function mount(PlatformDiscoveryService $discoveryService): void
    {
        $tenant = filament()->getTenant();
        
        $features = $discoveryService->discoverByType('business_module');

        // Query database state for the current tenant
        $activeModules = TenantModule::where('tenant_id', $tenant->id)
            ->where('enabled', true)
            ->pluck('module')
            ->toArray();

        foreach ($features as $feature) {
            $this->enabledFeatures[$feature->id] = in_array($feature->id, $activeModules);
        }
    }

    public function toggleFeature(string $featureId): void
    {
        $tenant = filament()->getTenant();
        $newState = !($this->enabledFeatures[$featureId] ?? false);

        // Update or insert db entry
        TenantModule::updateOrCreate(
            ['tenant_id' => $tenant->id, 'module' => $featureId],
            ['enabled' => $newState, 'licensed' => true]
        );

        $this->enabledFeatures[$featureId] = $newState;

        Notification::make()
            ->title($newState ? 'Feature Activated' : 'Feature Deactivated')
            ->success()
            ->send();
    }

    public function getViewData(): array
    {
        $discoveryService = app(PlatformDiscoveryService::class);
        
        return [
            'features' => $discoveryService->discoverByType('business_module'),
        ];
    }
}
