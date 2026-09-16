<?php

namespace App\Filament\Resources\Marketing\NavItems\Schemas;

use Filament\Schemas\Schema;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;

class NavItemForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Navigation Details')->schema([
                    TextInput::make('label')
                        ->required()
                        ->maxLength(255),
                    TextInput::make('url')
                        ->required()
                        ->maxLength(255),
                    Select::make('location')
                        ->options([
                            'header' => 'Header',
                            'footer' => 'Footer',
                        ])
                        ->default('header')
                        ->required(),
                    Select::make('target')
                        ->options([
                            '_self' => 'Same Window',
                            '_blank' => 'New Window',
                        ])
                        ->default('_self')
                        ->required(),
                    TextInput::make('sort_order')
                        ->numeric()
                        ->default(0),
                    Toggle::make('is_active')
                        ->default(true),
                ])->columns(2),
            ]);
    }
}

