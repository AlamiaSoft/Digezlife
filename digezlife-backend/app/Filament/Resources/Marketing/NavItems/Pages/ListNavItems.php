<?php

namespace App\Filament\Resources\Marketing\NavItems\Pages;

use App\Filament\Resources\Marketing\NavItems\NavItemResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListNavItems extends ListRecords
{
    protected static string $resource = NavItemResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
