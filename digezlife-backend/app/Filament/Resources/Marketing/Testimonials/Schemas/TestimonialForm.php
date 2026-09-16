<?php

namespace App\Filament\Resources\Marketing\Testimonials\Schemas;

use Filament\Schemas\Schema;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;

class TestimonialForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Testimonial Details')->schema([
                    TextInput::make('name')
                        ->required()
                        ->maxLength(255),
                    TextInput::make('company')
                        ->maxLength(255),
                    TextInput::make('position')
                        ->maxLength(255),
                    TextInput::make('rating')
                        ->numeric()
                        ->default(5)
                        ->minValue(1)
                        ->maxValue(5)
                        ->required(),
                    Textarea::make('quote')
                        ->required()
                        ->maxLength(65535)
                        ->columnSpanFull(),
                    SpatieMediaLibraryFileUpload::make('avatar')
                        ->collection('avatar')
                        ->avatar()
                        ->columnSpanFull(),
                    TextInput::make('sort_order')
                        ->numeric()
                        ->default(0),
                    Toggle::make('is_active')
                        ->default(true),
                ])->columns(2),
            ]);
    }
}

