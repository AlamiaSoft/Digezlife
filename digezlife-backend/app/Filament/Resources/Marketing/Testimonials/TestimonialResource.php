<?php

namespace App\Filament\Resources\Marketing\Testimonials;

use App\Filament\Resources\Marketing\Testimonials\Pages\CreateTestimonial;
use App\Filament\Resources\Marketing\Testimonials\Pages\EditTestimonial;
use App\Filament\Resources\Marketing\Testimonials\Pages\ListTestimonials;
use App\Filament\Resources\Marketing\Testimonials\Schemas\TestimonialForm;
use App\Filament\Resources\Marketing\Testimonials\Tables\TestimonialsTable;
use App\Models\Marketing\Testimonial;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class TestimonialResource extends Resource
{
    protected static ?string $model = Testimonial::class;

    protected static \UnitEnum|string|null $navigationGroup = 'Marketing';
    protected static ?int $navigationSort = 6;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return TestimonialForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return TestimonialsTable::configure($table);
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
            'index' => ListTestimonials::route('/'),
            'create' => CreateTestimonial::route('/create'),
            'edit' => EditTestimonial::route('/{record}/edit'),
        ];
    }
}
