<?php

namespace App\Filament\Resources\Marketing\FooterSections\Schemas;

use Filament\Schemas\Schema;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Repeater;
use Filament\Schemas\Components\Section;

class FooterSectionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Section Details')->schema([
                    TextInput::make('title')
                        ->required()
                        ->maxLength(255),
                    TextInput::make('sort_order')
                        ->numeric()
                        ->default(0),
                ])->columns(2),
                Section::make('Links')->schema([
                    Repeater::make('links')
                        ->schema([
                            TextInput::make('label')->required(),
                            TextInput::make('url')->required(),
                        ])
                        ->columns(2)
                        ->defaultItems(1)
                ]),
            ]);
    }
}

