<?php

namespace App\Filament\Widgets;

use Alamia\Core\Tenant\Models\Tenant;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;
use Illuminate\Database\Eloquent\Builder;

class RecentTenants extends TableWidget
{
    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(fn (): Builder => Tenant::query()->latest())
            ->columns([
                TextColumn::make('id')->label('Tenant ID')->sortable()->searchable(),
                TextColumn::make('name')->label('Organization Name')->sortable()->searchable(),
                TextColumn::make('email')->label('Owner Email')->searchable(),
                TextColumn::make('created_at')->label('Provisioned Date')->dateTime()->sortable(),
            ]);
    }
}
