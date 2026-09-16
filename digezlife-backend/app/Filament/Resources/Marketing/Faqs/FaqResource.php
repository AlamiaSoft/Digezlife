<?php

namespace App\Filament\Resources\Marketing\Faqs;

use App\Filament\Resources\Marketing\Faqs\Pages\CreateFaq;
use App\Filament\Resources\Marketing\Faqs\Pages\EditFaq;
use App\Filament\Resources\Marketing\Faqs\Pages\ListFaqs;
use App\Filament\Resources\Marketing\Faqs\Schemas\FaqForm;
use App\Filament\Resources\Marketing\Faqs\Tables\FaqsTable;
use App\Models\Marketing\Faq;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class FaqResource extends Resource
{
    protected static ?string $model = Faq::class;

    protected static \UnitEnum|string|null $navigationGroup = 'Marketing';
    protected static ?int $navigationSort = 7;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return FaqForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return FaqsTable::configure($table);
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
            'index' => ListFaqs::route('/'),
            'create' => CreateFaq::route('/create'),
            'edit' => EditFaq::route('/{record}/edit'),
        ];
    }
}
