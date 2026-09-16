<?php

namespace App\Filament\Pages\Marketing;

use App\Models\Marketing\Branding;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Schemas\Schema;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\ColorPicker;
use Filament\Schemas\Components\Section;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Pages\Page;
use Filament\Actions\Action;
use Filament\Notifications\Notification;

class ManageBranding extends Page implements HasForms
{
    use InteractsWithForms;

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-swatch';
    protected static \UnitEnum|string|null $navigationGroup = 'Marketing';
    protected static ?int $navigationSort = 1;
    protected static ?string $title = 'Branding Settings';

    protected string $view = 'filament.pages.marketing.manage-branding';

    public ?array $data = [];

    public function mount(): void
    {
        $branding = Branding::singleton();
        $this->form->fill($branding->attributesToArray());
    }

    public function form(Schema $form): Schema
    {
        return $form
            ->schema([
                Section::make('General')->schema([
                    TextInput::make('app_name')->required(),
                    TextInput::make('tagline'),
                    TextInput::make('footer_copyright'),
                ]),
                Section::make('Colors')->schema([
                    ColorPicker::make('primary_color'),
                    ColorPicker::make('secondary_color'),
                    ColorPicker::make('accent_color'),
                ])->columns(3),
                Section::make('Social Links')->schema([
                    TextInput::make('facebook_url')->url(),
                    TextInput::make('twitter_url')->url(),
                    TextInput::make('linkedin_url')->url(),
                    TextInput::make('instagram_url')->url(),
                    TextInput::make('youtube_url')->url(),
                    TextInput::make('github_url')->url(),
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
        Branding::singleton()->update($data);
        Notification::make()->success()->title('Saved successfully')->send();
    }
}

