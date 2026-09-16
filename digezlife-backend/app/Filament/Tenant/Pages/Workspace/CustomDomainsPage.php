<?php

namespace App\Filament\Tenant\Pages\Workspace;

use Filament\Pages\Page;
use Alamia\Core\Tenant\Models\Tenant;

class CustomDomainsPage extends Page
{
    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-globe-alt';
    protected static ?string $title = 'Domains & Subdomains';
    protected static \UnitEnum|string|null $navigationGroup = 'Workspace';
    protected static ?string $navigationLabel = 'Domains';
    protected static ?string $slug = 'domains';

    protected string $view = 'filament.tenant.pages.workspace.custom-domains-page';

    public array $domains = [];

    public function mount(): void
    {
        $tenant = filament()->getTenant();
        // Load domains
        $this->domains = $tenant->domains()->get()->toArray();
    }
}
