@extends('layouts.app')

@section('title', 'Features - ' . config('app.name'))

@section('content')
    <div class="pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
        <div class="relative max-w-7xl mx-auto">
            <div class="text-center">
                <h2 class="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">
                    All Features
                </h2>
                <p class="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                    Explore everything our platform has to offer to help you succeed.
                </p>
            </div>
            <div class="mt-12">
                @include('marketing.partials._features')
            </div>
        </div>
    </div>
@endsection
