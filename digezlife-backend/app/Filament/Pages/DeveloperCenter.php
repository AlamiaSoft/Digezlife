<?php

namespace App\Filament\Pages;

use Alamia\Core\Kernel\Alamia;
use Alamia\Core\Platform\Discovery\PlatformDiscoveryService;
use Alamia\Core\Platform\Lifecycle\ModuleLifecycleService;
use Alamia\Core\Platform\Services\DeveloperToolsService;
use Filament\Actions\Action;
use Filament\Forms\Components\Checkbox;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Wizard\Step;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Livewire\Attributes\Computed;

class DeveloperCenter extends Page
{
    protected string $view = 'filament.pages.developer-center';

    public static function getNavigationIcon(): ?string
    {
        return 'heroicon-o-command-line';
    }

    public static function getNavigationGroup(): ?string
    {
        return 'System';
    }

    public static function getNavigationLabel(): string
    {
        return 'Developer Center';
    }

    public function getTitle(): string|\Illuminate\Contracts\Support\Htmlable
    {
        return 'Developer Center';
    }

    public string $activeTab = 'overview';
    public string $searchQuery = '';

    public function mount(): void
    {
        // Load initial state if necessary
    }

    #[Computed]
    public function filteredComponents()
    {
        /** @var PlatformDiscoveryService $discovery */
        $discovery = app(PlatformDiscoveryService::class);

        if ($this->activeTab === 'overview') {
            return collect();
        }

        $typeMap = [
            'platform' => 'core_domain',
            'modules' => 'business_module',
            'marketplace' => 'marketplace',
        ];

        $type = $typeMap[$this->activeTab] ?? null;

        if ($type) {
            return $discovery->discoverByType($type, $this->searchQuery);
        }

        return collect();
    }

    #[Computed]
    public function doctorStatus()
    {
        return app(DeveloperToolsService::class)->getDoctorCached();
    }

    #[Computed]
    public function summary()
    {
        return app(PlatformDiscoveryService::class)->summary();
    }

    #[Computed]
    public function platformInfo()
    {
        return [
            'php' => PHP_VERSION,
            'laravel' => app()->version(),
            'filament' => \Composer\InstalledVersions::getPrettyVersion('filament/filament'),
            'alamia' => Alamia::version(),
        ];
    }

    public function toggleModule(string $path): void
    {
        $lifecycle = app(ModuleLifecycleService::class);
        $enabled = $lifecycle->isEnabled($path);

        if ($enabled) {
            $lifecycle->disable($path);
            Notification::make()->title('Module disabled')->success()->send();
        } else {
            $lifecycle->enable($path);
            Notification::make()->title('Module enabled')->success()->send();
        }
        
        $this->dispatch('refresh-components');
    }

    public function refreshDoctor(): void
    {
        app(DeveloperToolsService::class)->refreshDoctor();
        Notification::make()->title('Health check refreshed')->success()->send();
        unset($this->doctorStatus);
    }

    public function validateAll(): void
    {
        $result = app(DeveloperToolsService::class)->validateModule();
        
        Notification::make()
            ->title($result['success'] ? 'Validation Passed' : 'Validation Failed')
            ->body(nl2br(e($result['output'])))
            ->status($result['success'] ? 'success' : 'danger')
            ->send();
    }

    public function validateSingle(string $name): void
    {
        $result = app(DeveloperToolsService::class)->validateModule($name);
        
        Notification::make()
            ->title($result['success'] ? 'Validation Passed' : 'Validation Failed')
            ->body(nl2br(e($result['output'])))
            ->status($result['success'] ? 'success' : 'danger')
            ->send();
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('createModule')
                ->label('New Module')
                ->icon('heroicon-o-plus')
                ->steps([
                    Step::make('Basic Info')
                        ->schema([
                            TextInput::make('name')
                                ->label('Module Name')
                                ->required()
                                ->placeholder('e.g. Invoicing'),
                            TextInput::make('namespace')
                                ->label('Module Namespace')
                                ->placeholder('e.g. Alamia\Modules\Invoicing (Auto-derived)'),
                            TextInput::make('description')
                                ->label('Description')
                                ->placeholder('Brief description of the module'),
                            Select::make('category')
                                ->label('Category')
                                ->options([
                                    'finance' => 'Finance',
                                    'hr' => 'Human Resources',
                                    'sales' => 'Sales',
                                    'operations' => 'Operations',
                                    'other' => 'Other',
                                ]),
                        ]),
                    Step::make('Features')
                        ->schema([
                            Checkbox::make('tenant_aware')
                                ->label('Tenant Aware?')
                                ->default(true),
                            Checkbox::make('requires_billing')
                                ->label('Requires Billing?'),
                            Checkbox::make('requires_notifications')
                                ->label('Requires Notifications?'),
                            Checkbox::make('requires_audit')
                                ->label('Requires Audit?'),
                            Checkbox::make('requires_feature_flags')
                                ->label('Requires Feature Flags?'),
                        ]),
                    Step::make('Generation')
                        ->schema([
                            Checkbox::make('generate_tests')
                                ->label('Generate Tests?')
                                ->default(true),
                            Checkbox::make('generate_api')
                                ->label('Generate API Controllers?'),
                            Checkbox::make('generate_filament')
                                ->label('Generate Filament Resources?')
                                ->default(true),
                        ]),
                ])
                ->action(function (array $data) {
                    $result = app(DeveloperToolsService::class)->createModule($data);
                    
                    if ($result['success']) {
                        Notification::make()
                            ->title('Module created successfully')
                            ->success()
                            ->send();
                    } else {
                        Notification::make()
                            ->title('Module creation failed')
                            ->body($result['output'])
                            ->danger()
                            ->send();
                    }
                }),
        ];
    }
}
