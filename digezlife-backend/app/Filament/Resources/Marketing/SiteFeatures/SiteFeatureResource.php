<?php

namespace App\Filament\Resources\Marketing\SiteFeatures;

use App\Filament\Resources\Marketing\SiteFeatures\Pages\CreateSiteFeature;
use App\Filament\Resources\Marketing\SiteFeatures\Pages\EditSiteFeature;
use App\Filament\Resources\Marketing\SiteFeatures\Pages\ListSiteFeatures;
use App\Filament\Resources\Marketing\SiteFeatures\Schemas\SiteFeatureForm;
use App\Filament\Resources\Marketing\SiteFeatures\Tables\SiteFeaturesTable;
use App\Models\Marketing\SiteFeature;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class SiteFeatureResource extends Resource
{
    protected static ?string $model = SiteFeature::class;

    protected static \UnitEnum|string|null $navigationGroup = 'Marketing';
    protected static ?int $navigationSort = 4;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return SiteFeatureForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SiteFeaturesTable::configure($table);
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
            'index' => ListSiteFeatures::route('/'),
            'create' => CreateSiteFeature::route('/create'),
            'edit' => EditSiteFeature::route('/{record}/edit'),
        ];
    }
}
