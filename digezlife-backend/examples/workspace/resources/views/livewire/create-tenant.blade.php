<?php

use Alamia\Core\Shared\DTOs\TenantProvisioningData;
use Alamia\Core\Shared\ValueObjects\PlainPassword;
use Alamia\Core\Tenant\Models\Tenant;
use Alamia\Core\Tenant\Services\TenantProvisioningService;
use Livewire\Volt\Component;

new class extends Component {
    public string $name = '';
    public string $subdomain = '';

    public function createTenant(): void
    {
        $this->validate([
            'name'      => 'required|min:3',
            'subdomain' => 'required|min:3|alpha_dash|unique:tenants,id',
        ]);

        $dto = new TenantProvisioningData(
            subdomain:     $this->subdomain,
            tenantName:    $this->name,
            adminEmail:    'admin@' . $this->subdomain . '.com',
            adminPassword: new PlainPassword('password'),
        );

        app(TenantProvisioningService::class)->provision($dto);

        session()->flash('message', 'Workspace created! Login at: http://' . $this->subdomain . '.localhost:8000/login');

        $this->name      = '';
        $this->subdomain = '';
    }

    public function with(): array
    {
        return ['tenants' => Tenant::all()];
    }
};
?>

<div>
    <form wire:submit="createTenant" class="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow text-gray-800">
        <h2 class="text-2xl font-bold mb-4">Create Workspace</h2>

        @if (session()->has('message'))
            <div class="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
                {{ session('message') }}
            </div>
        @endif

        <div class="mb-4">
            <label class="block text-gray-700 font-bold mb-2">Workspace Name</label>
            <input type="text" wire:model="name"
                   class="w-full border border-gray-300 rounded px-3 py-2"
                   placeholder="Acme Corp">
            @error('name') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
        </div>

        <div class="mb-4">
            <label class="block text-gray-700 font-bold mb-2">Subdomain</label>
            <div class="flex">
                <input type="text" wire:model="subdomain"
                       class="flex-1 border border-gray-300 rounded-l px-3 py-2"
                       placeholder="acme">
                <span class="bg-gray-100 border border-gray-300 border-l-0 rounded-r px-3 py-2 text-gray-500">.localhost</span>
            </div>
            @error('subdomain') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
        </div>

        <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Create Workspace
        </button>
    </form>

    <div class="max-w-md mx-auto mt-6 p-6 bg-white rounded shadow text-gray-800">
        <h2 class="text-xl font-bold mb-4">Existing Workspaces</h2>

        @if($tenants->isEmpty())
            <p class="text-gray-500 text-sm">No workspaces yet.</p>
        @else
            <ul class="space-y-3">
                @foreach($tenants as $t)
                    <li class="border rounded p-3 flex justify-between items-center">
                        <div>
                            <p class="font-semibold">{{ $t->name }}</p>
                            <p class="text-xs text-gray-500">{{ $t->id }}.localhost:8000</p>
                        </div>
                        <a href="http://{{ $t->id }}.localhost:8000/login"
                           class="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-gray-700">
                            Login &rarr;
                        </a>
                    </li>
                @endforeach
            </ul>
        @endif
    </div>
</div>
