<?php

namespace App\Filament\Pages\Marketing;

use App\Models\Marketing\SeoSetting;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Schemas\Schema;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Section;
use Filament\Pages\Page;
use Filament\Actions\Action;
use Filament\Notifications\Notification;

class ManageSeoSettings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-magnifying-glass';
    protected static \UnitEnum|string|null $navigationGroup = 'Marketing';
    protected static ?int $navigationSort = 3;
    protected static ?string $title = 'SEO Settings';

    protected string $view = 'filament.pages.marketing.manage-seo-settings';

    public ?array $data = [];

    public function mount(): void
    {
        $seo = SeoSetting::singleton();
        $this->form->fill($seo->attributesToArray());
    }

    public function form(Schema $form): Schema
    {
        return $form
            ->schema([
                Section::make('Meta Tags')->schema([
                    TextInput::make('site_title')->required(),
                    Textarea::make('meta_description')->columnSpanFull(),
                    TextInput::make('canonical_url')->url(),
                    TextInput::make('robots')->default('index, follow'),
                ])->columns(2),
                Section::make('Social Images')->schema([
                    TextInput::make('og_image')->label('Open Graph Image URL')->url(),
                    TextInput::make('twitter_image')->label('Twitter Image URL')->url(),
                ])->columns(2),
                Section::make('Analytics')->schema([
                    TextInput::make('analytics_id')->label('Google Analytics ID'),
                    TextInput::make('google_verification')->label('Google Site Verification'),
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
        SeoSetting::singleton()->update($data);
        Notification::make()->success()->title('Saved successfully')->send();
    }
}

