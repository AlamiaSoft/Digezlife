<?php

namespace App\Filament\Resources\Marketing\NavItems\Pages;

use App\Filament\Resources\Marketing\NavItems\NavItemResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditNavItem extends EditRecord
{
    protected static string $resource = NavItemResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
