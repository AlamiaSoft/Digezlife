@if(isset($testimonials) && $testimonials->count() > 0)
<section class="bg-gray-50 py-12 md:py-20 lg:py-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-center text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-12">
            Loved by builders worldwide
        </h2>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            @foreach($testimonials as $testimonial)
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div class="flex items-center mb-6">
                        <div class="flex text-yellow-400">
                            @for($i = 0; $i < $testimonial->rating; $i++)
                                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            @endfor
                        </div>
                    </div>
                    <blockquote class="text-gray-700 text-lg mb-6">
                        "{{ $testimonial->quote }}"
                    </blockquote>
                    <div class="flex items-center">
                        @if($testimonial->getFirstMediaUrl('avatar'))
                            <img class="h-12 w-12 rounded-full object-cover mr-4" src="{{ $testimonial->getFirstMediaUrl('avatar') }}" alt="{{ $testimonial->name }}">
                        @else
                            <div class="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-4">
                                {{ substr($testimonial->name, 0, 1) }}
                            </div>
                        @endif
                        <div>
                            <div class="text-base font-medium text-gray-900">{{ $testimonial->name }}</div>
                            <div class="text-sm text-gray-500">{{ $testimonial->position }}{{ $testimonial->position && $testimonial->company ? ' at ' : '' }}{{ $testimonial->company }}</div>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    </div>
</section>
@endif
