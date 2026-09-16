<?php

namespace App\Filament\Resources\Marketing\SiteFeatures\Pages;

use App\Filament\Resources\Marketing\SiteFeatures\SiteFeatureResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListSiteFeatures extends ListRecords
{
    protected static string $resource = SiteFeatureResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
