<?php

namespace App\Filament\Resources\Marketing\FooterSections\Pages;

use App\Filament\Resources\Marketing\FooterSections\FooterSectionResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditFooterSection extends EditRecord
{
    protected static string $resource = FooterSectionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
