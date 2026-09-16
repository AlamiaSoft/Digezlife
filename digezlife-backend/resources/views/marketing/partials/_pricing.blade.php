@if(isset($plans) && $plans->count() > 0)
<div class="bg-white" id="pricing">
    <div class="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div class="sm:flex sm:flex-col sm:align-center">
            <h1 class="text-5xl font-extrabold text-gray-900 sm:text-center">Pricing Plans</h1>
            <p class="mt-5 text-xl text-gray-500 sm:text-center">Start building for free, then add a site plan to go live. Account plans unlock additional features.</p>
        </div>
        <div class="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
            @foreach($plans as $plan)
                <div class="border {{ $plan->is_popular ? 'border-primary shadow-xl ring-2 ring-primary' : 'border-gray-200' }} rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
                    <div class="p-6">
                        <h2 class="text-lg leading-6 font-medium text-gray-900">{{ $plan->name }}</h2>
                        @if($plan->description)
                            <p class="mt-4 text-sm text-gray-500">{{ $plan->description }}</p>
                        @endif
                        <p class="mt-8">
                            <span class="text-4xl font-extrabold text-gray-900">${{ $plan->price }}</span>
                            <span class="text-base font-medium text-gray-500">/{{ $plan->billing_period }}</span>
                        </p>
                        <a href="{{ $plan->button_url ?? route('register') }}" class="mt-8 block w-full {{ $plan->is_popular ? 'bg-primary text-white hover:bg-opacity-90' : 'bg-gray-800 text-white hover:bg-gray-900' }} py-2 px-4 border border-transparent rounded-md text-center text-sm font-semibold transition-colors">
                            {{ $plan->button_text ?? 'Buy ' . $plan->name }}
                        </a>
                    </div>
                    <div class="pt-6 pb-8 px-6">
                        <h3 class="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
                        <ul role="list" class="mt-6 space-y-4">
                            @foreach($plan->features as $feature)
                                <li class="flex space-x-3">
                                    @if($feature->included)
                                        <!-- Heroicon name: solid/check -->
                                        <svg class="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                        </svg>
                                    @else
                                        <!-- Heroicon name: solid/minus -->
                                        <svg class="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                          <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
                                        </svg>
                                    @endif
                                    <span class="text-sm text-gray-500 {{ !$feature->included ? 'line-through' : '' }}">{{ $feature->feature }}</span>
                                </li>
                            @endforeach
                        </ul>
                    </div>
                </div>
            @endforeach
        </div>
    </div>
</div>
@endif
