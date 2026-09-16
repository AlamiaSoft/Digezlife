<x-filament-panels::page>
    <x-filament::section>
        <form wire:submit="save" class="space-y-6">
            {{ $this->form }}

            <div class="flex justify-end">
                <x-filament::button type="submit">
                    Save Changes
                </x-filament::button>
            </div>
        </form>
    </x-filament::section>
</x-filament-panels::page>
