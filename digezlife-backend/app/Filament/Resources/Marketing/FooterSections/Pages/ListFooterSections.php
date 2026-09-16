<?php

namespace App\Filament\Resources\Marketing\FooterSections\Pages;

use App\Filament\Resources\Marketing\FooterSections\FooterSectionResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListFooterSections extends ListRecords
{
    protected static string $resource = FooterSectionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
