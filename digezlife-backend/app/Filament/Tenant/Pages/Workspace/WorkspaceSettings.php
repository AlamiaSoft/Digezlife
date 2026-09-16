<?php

namespace App\Filament\Tenant\Pages\Workspace;

use Filament\Pages\Page;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Schemas\Schema;
use Filament\Notifications\Notification;

use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Concerns\InteractsWithForms;

class WorkspaceSettings extends Page implements HasForms
{
    use InteractsWithForms;
    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-briefcase';
    protected static ?string $title = 'Workspace Settings';
    protected static \UnitEnum|string|null $navigationGroup = 'Workspace';
    protected static ?string $navigationLabel = 'General';
    protected static ?string $slug = 'workspace-settings';

    protected string $view = 'filament.tenant.pages.workspace.workspace-settings';

    public ?array $data = [];

    public function mount(): void
    {
        $tenant = filament()->getTenant();
        $this->form->fill([
            'name' => $tenant->name,
            'email' => $tenant->email,
            'phone' => $tenant->phone,
            'timezone' => $tenant->settings['timezone'] ?? 'UTC',
            'currency' => $tenant->settings['currency'] ?? 'USD',
        ]);
    }

    public function form(Schema $form): Schema
    {
        return $form
            ->schema([
                TextInput::make('name')
                    ->required(),
                TextInput::make('email')
                    ->email()
                    ->required(),
                TextInput::make('phone'),
                Select::make('timezone')
                    ->options([
                        'UTC' => 'UTC',
                        'America/New_York' => 'Eastern Time',
                        'Europe/London' => 'London',
                        'Asia/Dubai' => 'Dubai',
                    ]),
                Select::make('currency')
                    ->options([
                        'USD' => 'USD ($)',
                        'EUR' => 'EUR (€)',
                        'GBP' => 'GBP (£)',
                    ]),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $tenant = filament()->getTenant();
        $formData = $this->form->getState();

        $tenant->update([
            'name' => $formData['name'],
            'email' => $formData['email'],
            'phone' => $formData['phone'],
            'settings' => array_merge($tenant->settings ?? [], [
                'timezone' => $formData['timezone'],
                'currency' => $formData['currency'],
            ]),
        ]);

        Notification::make()
            ->title('Workspace settings saved')
            ->success()
            ->send();
    }
}
