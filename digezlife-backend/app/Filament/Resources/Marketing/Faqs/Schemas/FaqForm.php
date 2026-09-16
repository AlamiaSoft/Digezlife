<?php

namespace App\Filament\Resources\Marketing\Faqs\Schemas;

use Filament\Schemas\Schema;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;

class FaqForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('FAQ Details')->schema([
                    TextInput::make('question')
                        ->required()
                        ->maxLength(255)
                        ->columnSpanFull(),
                    Textarea::make('answer')
                        ->required()
                        ->maxLength(65535)
                        ->columnSpanFull(),
                    TextInput::make('sort_order')
                        ->numeric()
                        ->default(0),
                    Toggle::make('is_active')
                        ->default(true),
                ])->columns(2),
            ]);
    }
}

