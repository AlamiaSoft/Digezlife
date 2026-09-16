@extends('layouts.minimal')

@section('title', 'Page Not Found - 404')

@section('content')
    <div class="text-center">
        <h1 class="text-9xl font-extrabold text-primary">404</h1>
        <h2 class="text-3xl font-bold text-gray-900 mt-4">Page Not Found</h2>
        <p class="mt-2 text-lg text-gray-600">The page you are looking for doesn't exist or has been moved.</p>
        <div class="mt-6">
            <a href="{{ route('home') }}" class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-opacity-90">
                Go back home
            </a>
        </div>
    </div>
@endsection
