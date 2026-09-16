<?php

namespace App\Filament\Resources\Plans\Schemas;

use Filament\Schemas\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class PlanForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Plan Details')
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn ($state, callable $set) => $set('slug', str($state)->slug())),
                        TextInput::make('slug')
                            ->required()
                            ->maxLength(255),
                        TextInput::make('price')
                            ->numeric()
                            ->required()
                            ->prefix('$')
                            ->helperText('Price in cents (e.g. 999 = $9.99)'),
                        Select::make('currency')
                            ->options([
                                'USD' => 'USD',
                                'EUR' => 'EUR',
                                'GBP' => 'GBP',
                            ])
                            ->default('USD')
                            ->required(),
                        Select::make('interval')
                            ->options([
                                'monthly'   => 'Monthly',
                                'yearly'    => 'Yearly',
                                'weekly'    => 'Weekly',
                                'one_time'  => 'One Time',
                            ])
                            ->required(),
                        Toggle::make('is_active')
                            ->label('Active')
                            ->default(true),
                    ])->columns(2),
            ]);
    }
}
