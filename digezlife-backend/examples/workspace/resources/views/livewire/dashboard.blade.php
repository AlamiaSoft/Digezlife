<?php

use Livewire\Volt\Component;
use Illuminate\Support\Facades\Auth;

new class extends Component {
    public function logout()
    {
        Auth::logout();
        session()->invalidate();
        session()->regenerateToken();
        
        return redirect('/');
    }
};
?>

<div>
    <div class="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow text-gray-800">
        <div class="flex justify-between items-center mb-6 border-b pb-4">
            <h2 class="text-2xl font-bold">Dashboard</h2>
            <button wire:click="logout" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                Log Out
            </button>
        </div>
        
        <div class="mb-4">
            <p class="text-lg">Welcome back, <strong>{{ auth()->user()->name }}</strong>!</p>
            <p class="text-gray-600">Email: {{ auth()->user()->email }}</p>
            
            @if(tenant())
                <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded mb-6">
                    <h3 class="font-bold text-blue-800 mb-2">Tenant Context Active</h3>
                    <p class="text-blue-700">You are currently logged into the <strong>{{ tenant('name') }}</strong> workspace.</p>
                    <p class="text-blue-700">Tenant ID: {{ tenant('id') }}</p>
                </div>
                
                <h3 class="text-xl font-bold mt-8 mb-4">Workspace Features</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a href="{{ route('settings.general') }}" class="block p-4 border rounded hover:bg-gray-50 transition">
                        <h4 class="font-bold text-lg text-gray-800">Settings</h4>
                        <p class="text-sm text-gray-600">Configure general workspace settings.</p>
                    </a>
                    
                    <a href="{{ route('notifications.index') }}" class="block p-4 border rounded hover:bg-gray-50 transition">
                        <h4 class="font-bold text-lg text-gray-800">Notifications</h4>
                        <p class="text-sm text-gray-600">View your system notifications.</p>
                    </a>
                    
                    <a href="{{ route('audit-logs.index') }}" class="block p-4 border rounded hover:bg-gray-50 transition">
                        <h4 class="font-bold text-lg text-gray-800">Audit Logs</h4>
                        <p class="text-sm text-gray-600">Review system activity and logs.</p>
                    </a>
                    
                    <a href="{{ route('roles') }}" class="block p-4 border rounded hover:bg-gray-50 transition">
                        <h4 class="font-bold text-lg text-gray-800">Roles & Permissions</h4>
                        <p class="text-sm text-gray-600">Manage user access control.</p>
                    </a>
                    
                    <a href="/hello-module" class="block p-4 border rounded hover:bg-gray-50 transition">
                        <h4 class="font-bold text-lg text-gray-800">Hello Module</h4>
                        <p class="text-sm text-gray-600">Test the dynamically loaded sample module.</p>
                    </a>
                </div>
            @else
                <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <h3 class="font-bold text-yellow-800 mb-2">Central Context Active</h3>
                    <p class="text-yellow-700">You are on the central application. Only Super Admins usually log in here.</p>
                </div>
            @endif
        </div>
    </div>
</div>
