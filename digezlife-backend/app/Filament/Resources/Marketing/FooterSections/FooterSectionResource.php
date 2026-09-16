<?php

namespace App\Filament\Resources\Marketing\FooterSections;

use App\Filament\Resources\Marketing\FooterSections\Pages\CreateFooterSection;
use App\Filament\Resources\Marketing\FooterSections\Pages\EditFooterSection;
use App\Filament\Resources\Marketing\FooterSections\Pages\ListFooterSections;
use App\Filament\Resources\Marketing\FooterSections\Schemas\FooterSectionForm;
use App\Filament\Resources\Marketing\FooterSections\Tables\FooterSectionsTable;
use App\Models\Marketing\FooterSection;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class FooterSectionResource extends Resource
{
    protected static ?string $model = FooterSection::class;

    protected static \UnitEnum|string|null $navigationGroup = 'Marketing';
    protected static ?int $navigationSort = 9;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return FooterSectionForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return FooterSectionsTable::configure($table);
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
            'index' => ListFooterSections::route('/'),
            'create' => CreateFooterSection::route('/create'),
            'edit' => EditFooterSection::route('/{record}/edit'),
        ];
    }
}
