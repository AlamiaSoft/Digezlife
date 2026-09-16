<?php

namespace App\Filament\Resources\Marketing\NavItems;

use App\Filament\Resources\Marketing\NavItems\Pages\CreateNavItem;
use App\Filament\Resources\Marketing\NavItems\Pages\EditNavItem;
use App\Filament\Resources\Marketing\NavItems\Pages\ListNavItems;
use App\Filament\Resources\Marketing\NavItems\Schemas\NavItemForm;
use App\Filament\Resources\Marketing\NavItems\Tables\NavItemsTable;
use App\Models\Marketing\NavItem;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class NavItemResource extends Resource
{
    protected static ?string $model = NavItem::class;

    protected static \UnitEnum|string|null $navigationGroup = 'Marketing';
    protected static ?int $navigationSort = 8;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return NavItemForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return NavItemsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListNavItems::route('/'),
            'create' => CreateNavItem::route('/create'),
            'edit' => EditNavItem::route('/{record}/edit'),
        ];
    }
}
