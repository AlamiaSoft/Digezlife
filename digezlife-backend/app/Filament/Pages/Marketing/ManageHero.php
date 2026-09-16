<?php

namespace App\Filament\Pages\Marketing;

use App\Models\Marketing\HeroSection;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Schemas\Schema;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Section;
use Filament\Forms\Components\Toggle;
use Filament\Pages\Page;
use Filament\Actions\Action;
use Filament\Notifications\Notification;

class ManageHero extends Page implements HasForms
{
    use InteractsWithForms;

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-sparkles';
    protected static \UnitEnum|string|null $navigationGroup = 'Marketing';
    protected static ?int $navigationSort = 2;
    protected static ?string $title = 'Hero Section';

    protected string $view = 'filament.pages.marketing.manage-hero';

    public ?array $data = [];

    public function mount(): void
    {
        $hero = HeroSection::singleton();
        $this->form->fill($hero->attributesToArray());
    }

    public function form(Schema $form): Schema
    {
        return $form
            ->schema([
                Section::make('Content')->schema([
                    TextInput::make('headline')->required()->columnSpanFull(),
                    Textarea::make('sub_headline')->columnSpanFull(),
                    TextInput::make('video_url')->url()->columnSpanFull(),
                    Toggle::make('is_active')->default(true),
                ]),
                Section::make('Call to Actions')->schema([
                    TextInput::make('primary_cta_text'),
                    TextInput::make('primary_cta_url'),
                    TextInput::make('secondary_cta_text'),
                    TextInput::make('secondary_cta_url'),
                ])->columns(2),
            ])
            ->statePath('data');
    }

    protected function getFormActions(): array
    {
        return [
            Action::make('save')
                ->label('Save Changes')
                ->submit('save'),
        ];
    }

    public function save(): void
    {
        $data = $this->form->getState();
        HeroSection::singleton()->update($data);
        Notification::make()->success()->title('Saved successfully')->send();
    }
}

