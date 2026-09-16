<x-filament-panels::page>
    {{-- Platform Version Bar --}}
    <x-filament::section compact>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-2 text-sm">
                <x-filament::icon icon="heroicon-m-server" class="h-5 w-5 text-primary-500" />
                <span class="font-medium text-gray-700 dark:text-gray-200">Alamia Platform v{{ $this->platformInfo['alamia'] }}</span>
                <span class="text-gray-300 dark:text-gray-600">•</span>
                <span class="text-gray-600 dark:text-gray-400">PHP {{ $this->platformInfo['php'] }}</span>
                <span class="text-gray-300 dark:text-gray-600">•</span>
                <span class="text-gray-600 dark:text-gray-400">Laravel {{ $this->platformInfo['laravel'] }}</span>
                <span class="text-gray-300 dark:text-gray-600">•</span>
                <span class="text-gray-600 dark:text-gray-400">Filament {{ $this->platformInfo['filament'] }}</span>
            </div>
            
            <div class="flex items-center gap-3">
                <x-filament::badge :color="$this->doctorStatus['healthy'] ? 'success' : 'danger'">
                    {{ $this->doctorStatus['healthy'] ? 'Healthy' : 'Issues Detected' }} 
                    ({{ $this->doctorStatus['checks'] }} checks)
                </x-filament::badge>
                
                <x-filament::icon-button
                    icon="heroicon-m-arrow-path"
                    wire:click="refreshDoctor"
                    tooltip="Refresh Health Check"
                    color="gray"
                />
            </div>
        </div>
    </x-filament::section>

    {{-- Tabs Navigation --}}
    <x-filament::tabs>
        @php
            $tabs = [
                'overview' => ['label' => 'Overview', 'icon' => 'heroicon-m-squares-2x2', 'enabled' => true],
                'platform' => ['label' => 'Platform', 'icon' => 'heroicon-m-cpu-chip', 'enabled' => true],
                'modules' => ['label' => 'Modules', 'icon' => 'heroicon-m-puzzle-piece', 'enabled' => true],
                'applications' => ['label' => 'Applications', 'icon' => 'heroicon-m-device-phone-mobile', 'enabled' => false],
                'marketplace' => ['label' => 'Marketplace', 'icon' => 'heroicon-m-shopping-bag', 'enabled' => true],
                'diagnostics' => ['label' => 'Diagnostics', 'icon' => 'heroicon-m-beaker', 'enabled' => false],
                'generators' => ['label' => 'Generators', 'icon' => 'heroicon-m-sparkles', 'enabled' => false],
                'settings' => ['label' => 'Settings', 'icon' => 'heroicon-m-cog-8-tooth', 'enabled' => false],
            ];
        @endphp

        @foreach($tabs as $key => $tab)
            <x-filament::tabs.item 
                :active="$activeTab === $key"
                wire:click="$set('activeTab', '{{ $key }}')"
                :icon="$tab['icon']"
                :disabled="!$tab['enabled']"
                :badge="!$tab['enabled'] ? 'Soon' : null"
                badge-color="warning"
            >
                {{ $tab['label'] }}
            </x-filament::tabs.item>
        @endforeach
    </x-filament::tabs>

    {{-- Content Area --}}
    <div class="mt-4">
        @if($activeTab === 'overview')
            {{-- Dashboard --}}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {{-- Platform Health --}}
                <x-filament::section>
                    <x-slot name="heading">Platform Health</x-slot>
                    <div class="text-3xl font-bold {{ $this->doctorStatus['healthy'] ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400' }}">
                        {{ $this->doctorStatus['healthy'] ? '100%' : 'Needs Review' }}
                    </div>
                    <div class="text-sm text-gray-500 mt-2">
                        {{ $this->doctorStatus['issues'] }} issues found
                    </div>
                </x-filament::section>

                {{-- Core Domains --}}
                <x-filament::section>
                    <x-slot name="heading">Core Domains</x-slot>
                    <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                        {{ $this->summary['domains'] }}
                    </div>
                    <div class="text-sm text-gray-500 mt-2">
                        Platform capabilities
                    </div>
                </x-filament::section>

                {{-- Business Modules --}}
                <x-filament::section>
                    <x-slot name="heading">Business Modules</x-slot>
                    <div class="text-3xl font-bold text-primary-600 dark:text-primary-400">
                        {{ $this->summary['modules'] }}
                    </div>
                    <div class="text-sm text-gray-500 mt-2 flex gap-2">
                        <span class="text-success-600">{{ $this->summary['active_modules'] }} active</span>
                        <span>|</span>
                        <span>{{ $this->summary['modules'] - $this->summary['active_modules'] }} disabled</span>
                    </div>
                </x-filament::section>

                {{-- Installed Apps --}}
                <x-filament::section>
                    <x-slot name="heading">Installed Apps</x-slot>
                    <div class="text-3xl font-bold text-gray-900 dark:text-white">
                        4
                    </div>
                    <div class="text-sm text-gray-500 mt-2">
                        Admin, Api, Tenant, Marketing
                    </div>
                </x-filament::section>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <x-filament::section>
                    <x-slot name="heading">Quick Actions</x-slot>
                    
                    <div class="flex flex-col gap-4 mt-2">
                        <x-filament::button wire:click="validateAll" icon="heroicon-o-check-badge" size="lg" color="gray" class="w-full justify-start text-left">
                            <span class="block font-medium">Validate Platform</span>
                            <span class="block text-xs font-normal opacity-75">Run structural validation on all domains and modules.</span>
                        </x-filament::button>
                    </div>
                </x-filament::section>
                
                <x-filament::section>
                    <x-slot name="heading">Doctor Output</x-slot>
                    <x-slot name="headerEnd">
                        <span class="text-xs text-gray-500">
                            {{ \Carbon\Carbon::parse($this->doctorStatus['timestamp'])->diffForHumans() }}
                        </span>
                    </x-slot>
                    
                    <div class="bg-gray-900 rounded-lg p-4 font-mono text-xs text-gray-300 overflow-x-auto h-48">
                        <pre>{!! $this->doctorStatus['output'] !!}</pre>
                    </div>
                </x-filament::section>
            </div>

        @elseif(in_array($activeTab, ['platform', 'modules']))
            {{-- Modules & Domains List --}}
            <div class="mb-8 max-w-md">
                <x-filament::input.wrapper icon="heroicon-m-magnifying-glass">
                    <x-filament::input
                        type="text"
                        wire:model.live.debounce.300ms="searchQuery"
                        placeholder="Search {{ $activeTab }}..."
                    />
                </x-filament::input.wrapper>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style="gap: 1.5rem; margin-top: 1.5rem;">
                @forelse($this->filteredComponents as $moduleItem)
                    <div class="h-full">
                        <x-filament::section class="h-full {{ !$moduleItem->active ? 'opacity-75' : '' }}">
                            <div class="flex justify-between items-start mb-4">
                                <div class="flex gap-3">
                                    <x-filament::badge :color="$moduleItem->type === 'core_domain' ? 'indigo' : 'success'">
                                        <x-filament::icon icon="{{ $moduleItem->type === 'core_domain' ? 'heroicon-o-cpu-chip' : 'heroicon-o-puzzle-piece' }}" class="h-4 w-4" />
                                    </x-filament::badge>
                                    <div>
                                        <h3 class="font-semibold text-gray-900 dark:text-white">{{ $moduleItem->name }}</h3>
                                        <span class="text-xs text-gray-500">v{{ $moduleItem->version }}</span>
                                    </div>
                                </div>
                                
                                <x-filament::dropdown placement="bottom-end">
                                    <x-slot name="trigger">
                                        <x-filament::icon-button icon="heroicon-m-ellipsis-vertical" color="gray" />
                                    </x-slot>
                                    <x-filament::dropdown.list>
                                        @if($moduleItem->toggleable)
                                            <x-filament::dropdown.list.item
                                                wire:click="toggleModule('{{ $moduleItem->path }}')"
                                                icon="{{ $moduleItem->active ? 'heroicon-m-pause' : 'heroicon-m-play' }}">
                                                {{ $moduleItem->active ? 'Disable' : 'Enable' }}
                                            </x-filament::dropdown.list.item>
                                        @endif
                                        <x-filament::dropdown.list.item
                                            wire:click="validateSingle('{{ $moduleItem->name }}')"
                                            icon="heroicon-m-check-badge">
                                            Validate
                                        </x-filament::dropdown.list.item>
                                    </x-filament::dropdown.list>
                                </x-filament::dropdown>
                            </div>
                            
                            <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 h-10 overflow-hidden">
                                {{ $moduleItem->description }}
                            </p>
                            
                            <div class="flex flex-wrap gap-2 mb-4">
                                @if(isset($moduleItem->metadata['tenant_aware']) && $moduleItem->metadata['tenant_aware'])
                                    <x-filament::badge color="gray" size="sm">Tenant Aware</x-filament::badge>
                                @endif
                                @if(isset($moduleItem->metadata['permissions_count']) && $moduleItem->metadata['permissions_count'] > 0)
                                    <x-filament::badge color="info" size="sm">{{ $moduleItem->metadata['permissions_count'] }} Permissions</x-filament::badge>
                                @endif
                                @if(isset($moduleItem->metadata['capabilities']))
                                    @foreach(array_slice($moduleItem->metadata['capabilities'], 0, 2) as $cap)
                                        <x-filament::badge color="warning" size="sm">{{ $cap }}</x-filament::badge>
                                    @endforeach
                                @endif
                            </div>
                            
                            <div class="pt-4 border-t border-gray-200 dark:border-white/10 flex justify-between items-center text-xs">
                                <span class="font-medium {{ $moduleItem->active ? 'text-success-600 dark:text-success-400' : 'text-gray-500' }}">
                                    {{ $moduleItem->active ? 'Active' : 'Disabled' }}
                                </span>
                                <span class="text-gray-400">{{ $moduleItem->author }}</span>
                            </div>
                        </x-filament::section>
                    </div>
                @empty
                    <div class="col-span-full">
                        <x-filament::section>
                            <div class="text-center py-8">
                                <x-filament::icon icon="heroicon-o-inbox" class="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">No components found</h3>
                                <p class="text-sm text-gray-500 mt-1">Try adjusting your search query.</p>
                            </div>
                        </x-filament::section>
                    </div>
                @endforelse
            </div>

        @elseif($activeTab === 'marketplace')
            {{-- Marketplace Placeholder --}}
            <x-filament::section>
                <div class="text-center py-12">
                    <x-filament::icon icon="heroicon-o-shopping-bag" class="mx-auto h-12 w-12 text-primary-500 mb-4" />
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white">Marketplace</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-2">
                        The Alamia Marketplace provider is currently not available. 
                        In the future, you'll be able to browse and install official and community extensions directly from here.
                    </p>
                </div>
            </x-filament::section>
        @endif
    </div>
</x-filament-panels::page>
