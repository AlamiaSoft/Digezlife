<?php

namespace App\Filament\Tenant\Pages;

use Filament\Pages\Dashboard as BaseDashboard;
use Alamia\Core\Kernel\Experience\Adapters\FilamentAdapter;

class TenantDashboard extends BaseDashboard
{
    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-home';
    protected static ?string $title = 'Household Workspace';

    public function getWidgets(): array
    {
        return array_merge(
            parent::getWidgets(),
            FilamentAdapter::getWidgets('tenant')
        );
    }
}
