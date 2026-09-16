@if(isset($hero) && $hero->is_active)
<div class="relative bg-white overflow-hidden">
    <div class="max-w-7xl mx-auto">
        <div class="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-16 sm:pt-24 lg:pt-32">
            <main class="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div class="sm:text-center lg:text-left">
                    <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                        <span class="block xl:inline">{{ explode(' ', $hero->headline)[0] }}</span>
                        <span class="block text-primary xl:inline">{{ substr($hero->headline, strpos($hero->headline, ' ') + 1) }}</span>
                    </h1>
                    <p class="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                        {{ $hero->sub_headline }}
                    </p>
                    <div class="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-3">
                        @if($hero->primary_cta_text)
                            <div class="rounded-md shadow">
                                <a href="{{ url($hero->primary_cta_url) }}" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-opacity-90 md:py-4 md:text-lg transition-colors">
                                    {{ $hero->primary_cta_text }}
                                </a>
                            </div>
                        @endif
                        @if($hero->secondary_cta_text)
                            <div class="mt-3 sm:mt-0">
                                <a href="{{ url($hero->secondary_cta_url) }}" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-blue-50 hover:bg-blue-100 md:py-4 md:text-lg transition-colors">
                                    {{ $hero->secondary_cta_text }}
                                </a>
                            </div>
                        @endif
                    </div>
                </div>
            </main>
        </div>
    </div>
    @if($hero->getFirstMediaUrl('hero_image'))
        <div class="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <img class="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" src="{{ $hero->getFirstMediaUrl('hero_image') }}" alt="">
        </div>
    @endif
</div>
@endif
