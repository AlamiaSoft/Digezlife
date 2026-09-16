<?php

namespace App\Filament\Resources\Marketing\MarketingPlans\Pages;

use App\Filament\Resources\Marketing\MarketingPlans\MarketingPlanResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditMarketingPlan extends EditRecord
{
    protected static string $resource = MarketingPlanResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
