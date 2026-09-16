<?php

use Livewire\Volt\Component;
use Illuminate\Support\Facades\Auth;

new class extends Component {
    public $email = '';
    public $password = '';
    public $remember = false;

    public function login()
    {
        $this->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt(['email' => $this->email, 'password' => $this->password], $this->remember)) {
            session()->regenerate();
            return redirect()->intended('/dashboard');
        }

        $this->addError('email', 'The provided credentials do not match our records.');
    }
};
?>

<div>
    <form wire:submit="login" class="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow text-gray-800">
        <h2 class="text-2xl font-bold mb-4">Login</h2>
        
        <div class="mb-4">
            <label class="block text-gray-700 font-bold mb-2">Email Address</label>
            <input type="email" wire:model="email" class="w-full border border-gray-300 rounded px-3 py-2" placeholder="admin@acme.com" autofocus>
            @error('email') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
        </div>

        <div class="mb-4">
            <label class="block text-gray-700 font-bold mb-2">Password</label>
            <input type="password" wire:model="password" class="w-full border border-gray-300 rounded px-3 py-2">
            @error('password') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
        </div>

        <div class="mb-4 flex items-center">
            <input type="checkbox" wire:model="remember" id="remember" class="mr-2">
            <label for="remember" class="text-gray-700">Remember Me</label>
        </div>

        <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Log In
        </button>
    </form>
</div>
