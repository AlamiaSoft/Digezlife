@extends('layouts.app')

@section('title', 'Privacy Policy - ' . config('app.name'))

@section('content')
    <div class="relative py-16 bg-white overflow-hidden">
        <div class="relative px-4 sm:px-6 lg:px-8">
            <div class="text-lg max-w-prose mx-auto">
                <h1>
                    <span class="block text-base text-center text-primary font-semibold tracking-wide uppercase">Legal</span>
                    <span class="mt-2 block text-3xl text-center leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">Privacy Policy</span>
                </h1>
                <p class="mt-8 text-xl text-gray-500 leading-8">
                    This is a placeholder for your Privacy Policy.
                </p>
                <div class="mt-6 prose prose-primary prose-lg text-gray-500 mx-auto">
                    <p>Faucibus commodo massa rhoncus, volutpat. Dignissim sed eget risus enim. Mattis mauris semper sed amet vitae sed turpis id. Id pellentesque aliquam amet, egestas mattis.</p>
                </div>
            </div>
        </div>
    </div>
@endsection
