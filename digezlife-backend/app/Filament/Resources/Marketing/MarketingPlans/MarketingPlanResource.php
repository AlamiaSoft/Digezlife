<?php

namespace App\Filament\Resources\Marketing\MarketingPlans;

use App\Filament\Resources\Marketing\MarketingPlans\Pages\CreateMarketingPlan;
use App\Filament\Resources\Marketing\MarketingPlans\Pages\EditMarketingPlan;
use App\Filament\Resources\Marketing\MarketingPlans\Pages\ListMarketingPlans;
use App\Filament\Resources\Marketing\MarketingPlans\Schemas\MarketingPlanForm;
use App\Filament\Resources\Marketing\MarketingPlans\Tables\MarketingPlansTable;
use App\Models\Marketing\MarketingPlan;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class MarketingPlanResource extends Resource
{
    protected static ?string $model = MarketingPlan::class;

    protected static \UnitEnum|string|null $navigationGroup = 'Marketing';
    protected static ?int $navigationSort = 5;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return MarketingPlanForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return MarketingPlansTable::configure($table);
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
            'index' => ListMarketingPlans::route('/'),
            'create' => CreateMarketingPlan::route('/create'),
            'edit' => EditMarketingPlan::route('/{record}/edit'),
        ];
    }
}
