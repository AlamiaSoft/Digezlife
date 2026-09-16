<?php

use Livewire\Volt\Component;
use App\Settings\GeneralSettings;

new class extends Component {
    public string $siteName;
    public string $supportEmail;

    public function mount(GeneralSettings $settings)
    {
        $this->siteName = $settings->site_name;
        $this->supportEmail = $settings->support_email;
    }

    public function save(GeneralSettings $settings)
    {
        $this->validate([
            'siteName' => 'required|string|max:255',
            'supportEmail' => 'required|email|max:255',
        ]);

        $settings->site_name = $this->siteName;
        $settings->support_email = $this->supportEmail;
        $settings->save();

        session()->flash('status', 'Settings updated successfully.');
    }
}; ?>

<div>
    <div class="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow text-gray-800">
        <h2 class="text-2xl font-bold mb-6">General Settings</h2>

        @if (session('status'))
            <div class="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
                {{ session('status') }}
            </div>
        @endif

        <form wire:submit="save" class="space-y-4">
            <div>
                <label class="block text-gray-700 font-bold mb-2">Site Name</label>
                <input type="text" wire:model="siteName" class="w-full border border-gray-300 rounded px-3 py-2">
                @error('siteName') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="block text-gray-700 font-bold mb-2">Support Email</label>
                <input type="email" wire:model="supportEmail" class="w-full border border-gray-300 rounded px-3 py-2">
                @error('supportEmail') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
            </div>
            
            <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                Save Settings
            </button>
        </form>
    </div>
</div>
