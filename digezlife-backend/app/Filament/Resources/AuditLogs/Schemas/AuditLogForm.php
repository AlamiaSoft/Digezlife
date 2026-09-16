<?php

namespace App\Filament\Resources\AuditLogs\Schemas;

use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class AuditLogForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('event')
                    ->disabled(),
                TextInput::make('auditable_type')
                    ->label('Auditable Type')
                    ->disabled(),
                TextInput::make('auditable_id')
                    ->label('Auditable ID')
                    ->disabled(),
                TextInput::make('ip_address')
                    ->label('IP Address')
                    ->disabled(),
                TextInput::make('user_agent')
                    ->label('User Agent')
                    ->disabled()
                    ->columnSpanFull(),
                KeyValue::make('old_values')
                    ->label('Old Values')
                    ->disabled()
                    ->columnSpanFull(),
                KeyValue::make('new_values')
                    ->label('New Values')
                    ->disabled()
                    ->columnSpanFull(),
            ]);
    }
}
