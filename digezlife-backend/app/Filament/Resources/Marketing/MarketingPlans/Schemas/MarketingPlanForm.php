<?php

namespace App\Filament\Resources\Marketing\MarketingPlans\Schemas;

use Filament\Schemas\Schema;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Forms\Components\Repeater;

class MarketingPlanForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Plan Details')->schema([
                    TextInput::make('name')
                        ->required()
                        ->maxLength(255),
                    TextInput::make('slug')
                        ->required()
                        ->maxLength(255),
                    TextInput::make('price')
                        ->numeric()
                        ->prefix('$')
                        ->required(),
                    TextInput::make('billing_period')
                        ->default('monthly')
                        ->required()
                        ->maxLength(255),
                    Textarea::make('description')
                        ->maxLength(65535)
                        ->columnSpanFull(),
                    TextInput::make('badge')
                        ->maxLength(255),
                    TextInput::make('button_text')
                        ->maxLength(255),
                    TextInput::make('button_url')
                        ->maxLength(255),
                    TextInput::make('sort_order')
                        ->numeric()
                        ->default(0),
                    Toggle::make('is_popular')
                        ->default(false),
                    Toggle::make('is_active')
                        ->default(true),
                ])->columns(2),
                Section::make('Features')->schema([
                    Repeater::make('features')
                        ->relationship('features')
                        ->schema([
                            TextInput::make('feature')->required(),
                            Toggle::make('included')->default(true),
                        ])->columns(2)->orderColumn('sort_order')
                ]),
            ]);
    }
}

