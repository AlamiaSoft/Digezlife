<x-filament-panels::page>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @forelse($features as $feature)
            <x-filament::section>
                <div class="flex justify-between items-start mb-4">
                    <div class="flex gap-3">
                        <x-filament::badge color="success">
                            <x-filament::icon icon="heroicon-o-puzzle-piece" class="h-4 w-4" />
                        </x-filament::badge>
                        <div>
                            <h3 class="font-semibold text-base text-gray-900 dark:text-white">{{ $feature->name }}</h3>
                            <div class="text-xs text-gray-400 mt-0.5">Version {{ $feature->version }}</div>
                        </div>
                    </div>
                    
                    <x-filament::button 
                        wire:click="toggleFeature('{{ $feature->id }}')" 
                        size="xs" 
                        color="{{ ($enabledFeatures[$feature->id] ?? false) ? 'danger' : 'primary' }}">
                        {{ ($enabledFeatures[$feature->id] ?? false) ? 'Deactivate' : 'Activate' }}
                    </x-filament::button>
                </div>
                
                <p class="text-sm text-gray-600 dark:text-gray-300 my-4 leading-relaxed h-12 overflow-hidden">
                    {{ $feature->description }}
                </p>

                <div class="pt-3 mt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center text-xs">
                    <div>
                        <span class="text-gray-400 mr-1">Status:</span>
                        <span class="font-semibold {{ ($enabledFeatures[$feature->id] ?? false) ? 'text-success-600 dark:text-success-400' : 'text-gray-500' }}">
                            {{ ($enabledFeatures[$feature->id] ?? false) ? 'Active' : 'Inactive' }}
                        </span>
                    </div>
                    <div>
                        <span class="text-gray-400 mr-1">Developer:</span>
                        <span class="text-gray-600 dark:text-gray-300 font-medium">{{ $feature->author ?? 'System' }}</span>
                    </div>
                </div>
            </x-filament::section>
        @empty
            <div class="col-span-full">
                <x-filament::section>
                    <div class="text-center py-8">
                        <x-filament::icon icon="heroicon-o-inbox" class="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">No features available</h3>
                        <p class="text-sm text-gray-500 mt-1">There are no modular features discoverable on the platform.</p>
                    </div>
                </x-filament::section>
            </div>
        @endforelse
    </div>
</x-filament-panels::page>
