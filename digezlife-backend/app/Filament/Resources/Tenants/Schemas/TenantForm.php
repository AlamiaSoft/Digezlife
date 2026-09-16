<?php

namespace App\Filament\Resources\Tenants\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Schemas\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class TenantForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Identity')
                    ->schema([
                        TextInput::make('id')
                            ->label('Tenant Slug (ID)')
                            ->required()
                            ->maxLength(255)
                            ->disabledOn('edit'),
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255),
                        TextInput::make('email')
                            ->email()
                            ->maxLength(255),
                        TextInput::make('phone')
                            ->tel()
                            ->maxLength(50),
                    ])->columns(2),

                Section::make('Subscription')
                    ->schema([
                        TextInput::make('plan')
                            ->maxLength(100),
                        Select::make('status')
                            ->options([
                                'trial'     => 'Trial',
                                'active'    => 'Active',
                                'suspended' => 'Suspended',
                                'cancelled' => 'Cancelled',
                            ])
                            ->required(),
                        DateTimePicker::make('trial_ends_at')
                            ->label('Trial Ends At'),
                        DateTimePicker::make('subscription_ends_at')
                            ->label('Subscription Ends At'),
                    ])->columns(2),
            ]);
    }
}
