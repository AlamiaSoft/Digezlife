<?php

namespace App\Filament\Resources\Marketing\MarketingPlans\Pages;

use App\Filament\Resources\Marketing\MarketingPlans\MarketingPlanResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListMarketingPlans extends ListRecords
{
    protected static string $resource = MarketingPlanResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
