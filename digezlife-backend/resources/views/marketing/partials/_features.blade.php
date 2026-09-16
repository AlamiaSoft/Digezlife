@if(isset($features) && $features->count() > 0)
<div class="py-16 bg-gray-50 overflow-hidden lg:py-24" id="features">
    <div class="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
        <div class="relative">
            <h2 class="text-center text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                A better way to build your SaaS
            </h2>
            <p class="mt-4 max-w-3xl mx-auto text-center text-xl text-gray-500">
                Everything you need to launch your next big idea, built on a solid foundation.
            </p>
        </div>

        <div class="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div class="relative">
                <dl class="mt-10 space-y-10">
                    @foreach($features as $feature)
                        <div class="relative">
                            <dt>
                                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                                    <!-- Use icon field (can be raw svg or class, for now we assume a raw SVG or placeholder) -->
                                    @if(str_starts_with($feature->icon, '<svg'))
                                        {!! $feature->icon !!}
                                    @else
                                        <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    @endif
                                </div>
                                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">{{ $feature->title }}</p>
                            </dt>
                            <dd class="mt-2 ml-16 text-base text-gray-500">
                                {{ $feature->description }}
                            </dd>
                        </div>
                    @endforeach
                </dl>
            </div>
        </div>
    </div>
</div>
@endif
