<?php

use Livewire\Volt\Component;
use Spatie\Permission\Models\Role;

new class extends Component {
    public $roles = [];
    public $name = '';
    public $displayName = '';
    public $description = '';

    public function mount()
    {
        $this->loadRoles();
    }

    public function loadRoles()
    {
        $this->roles = Role::all()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name ?? $role->name,
                'description' => $role->description,
                'permissions_count' => $role->permissions ? $role->permissions->count() : 0,
            ];
        })->toArray();
    }

    public function createRole()
    {
        $this->validate([
            'name' => 'required|string|min:3|unique:roles,name',
            'displayName' => 'nullable|string|min:3',
        ]);

        Role::create([
            'name' => $this->name,
            'display_name' => $this->displayName,
            'description' => $this->description,
        ]);

        $this->name = '';
        $this->displayName = '';
        $this->description = '';

        $this->loadRoles();
        session()->flash('message', 'Role created successfully.');
    }
};
?>

<div>
    <div class="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow text-gray-800">
        <h2 class="text-2xl font-bold mb-6">Roles Management</h2>

        @if (session()->has('message'))
            <div class="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
                {{ session('message') }}
            </div>
        @endif

        <div class="mb-8 border-b pb-8">
            <h3 class="text-xl font-bold mb-4">Create New Role</h3>
            <form wire:submit="createRole" class="space-y-4">
                <div>
                    <label class="block text-gray-700 font-bold mb-2">Role System Name (e.g. tenant_editor)</label>
                    <input type="text" wire:model="name" class="w-full border border-gray-300 rounded px-3 py-2">
                    @error('name') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
                <div>
                    <label class="block text-gray-700 font-bold mb-2">Display Name (e.g. Tenant Editor)</label>
                    <input type="text" wire:model="displayName" class="w-full border border-gray-300 rounded px-3 py-2">
                    @error('displayName') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
                <div>
                    <label class="block text-gray-700 font-bold mb-2">Description</label>
                    <textarea wire:model="description" class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
                    @error('description') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
                <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    Create Role
                </button>
            </form>
        </div>

        <div>
            <h3 class="text-xl font-bold mb-4">Existing Roles</h3>
            <div class="bg-gray-50 rounded border border-gray-200">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="p-3 border-b">Display Name</th>
                            <th class="p-3 border-b">System Name</th>
                            <th class="p-3 border-b">Permissions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($roles as $role)
                            <tr class="border-b last:border-b-0">
                                <td class="p-3 font-semibold">{{ $role['display_name'] }}</td>
                                <td class="p-3 text-gray-600">{{ $role['name'] }}</td>
                                <td class="p-3">
                                    <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                        {{ $role['permissions_count'] }}
                                    </span>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="3" class="p-3 text-center text-gray-500">No roles found.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
