<?php

namespace App\Filament\Tenant\Resources\Identity\UsersResource\Pages;

use App\Filament\Tenant\Resources\Identity\UsersResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListUsers extends ListRecords
{
    protected static string $resource = UsersResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
