@extends('layouts.minimal')

@section('title', 'Register - ' . config('app.name'))

@section('content')
<div class="w-full max-w-md space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
    @php
        $branding = \App\Models\Marketing\Branding::singleton();
    @endphp
    
    <div class="text-center">
        @if($branding->getFirstMediaUrl('logo'))
            <img class="mx-auto h-12 w-auto" src="{{ $branding->getFirstMediaUrl('logo') }}" alt="{{ $branding->app_name }}">
        @else
            <h2 class="text-3xl font-bold text-primary">{{ $branding->app_name }}</h2>
        @endif
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
        </h2>
        <p class="mt-2 text-sm text-gray-600">
            Already have an account?
            <a href="{{ route('login') }}" class="font-medium text-primary hover:text-opacity-80 transition-colors">
                Sign in
            </a>
        </p>
    </div>
    
    <form class="mt-8 space-y-6" action="{{ route('register') }}" method="POST">
        @csrf
        
        <div class="rounded-md shadow-sm space-y-4">
            <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Full name</label>
                <input id="name" name="name" type="text" autocomplete="name" required class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Full name" value="{{ old('name') }}">
                @error('name')
                    <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                @enderror
            </div>
            
            <div>
                <label for="email-address" class="block text-sm font-medium text-gray-700">Email address</label>
                <input id="email-address" name="email" type="email" autocomplete="email" required class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Email address" value="{{ old('email') }}">
                @error('email')
                    <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                @enderror
            </div>
            
            <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <input id="password" name="password" type="password" required class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Password">
                @error('password')
                    <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                @enderror
            </div>

            <div>
                <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input id="password_confirmation" name="password_confirmation" type="password" required class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Confirm Password">
            </div>
        </div>

        <div>
            <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                Create account
            </button>
        </div>
    </form>
</div>
@endsection
