@extends('layouts.minimal')

@section('title', 'Log in - ' . config('app.name'))

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
            Sign in to your account
        </h2>
        <p class="mt-2 text-sm text-gray-600">
            Or
            <a href="{{ route('register') }}" class="font-medium text-primary hover:text-opacity-80 transition-colors">
                start your 14-day free trial
            </a>
        </p>
    </div>
    
    <form class="mt-8 space-y-6" action="{{ route('login') }}" method="POST">
        @csrf
        
        <div class="rounded-md shadow-sm space-y-4">
            <div>
                <label for="email-address" class="block text-sm font-medium text-gray-700">Email address</label>
                <input id="email-address" name="email" type="email" autocomplete="email" required class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Email address" value="{{ old('email') }}">
                @error('email')
                    <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                @enderror
            </div>
            
            <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <input id="password" name="password" type="password" autocomplete="current-password" required class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Password">
            </div>
        </div>

        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <input id="remember-me" name="remember" type="checkbox" class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
                <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                    Remember me
                </label>
            </div>

            <div class="text-sm">
                <a href="#" class="font-medium text-primary hover:text-opacity-80">
                    Forgot your password?
                </a>
            </div>
        </div>

        <div>
            <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg class="h-5 w-5 text-white group-hover:text-gray-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                    </svg>
                </span>
                Sign in
            </button>
        </div>
    </form>
</div>
@endsection
