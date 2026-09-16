<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    @php
        $seo = \App\Models\Marketing\SeoSetting::singleton();
        $branding = \App\Models\Marketing\Branding::singleton();
    @endphp
    
    <title>@yield('title', $seo->site_title ?? config('app.name'))</title>
    
    @if($seo->meta_description)
        <meta name="description" content="{{ $seo->meta_description }}">
    @endif
    
    @if($seo->canonical_url)
        <link rel="canonical" href="{{ $seo->canonical_url }}">
    @endif
    
    <meta name="robots" content="{{ $seo->robots ?? 'index, follow' }}">
    
    <!-- Open Graph -->
    @if($seo->og_image)
        <meta property="og:image" content="{{ $seo->og_image }}">
    @endif
    
    <!-- Twitter -->
    @if($seo->twitter_image)
        <meta name="twitter:image" content="{{ $seo->twitter_image }}">
    @endif

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800&display=swap" rel="stylesheet" />

    <!-- Tailwind CDN (Temporary for Phase 5.1) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        primary: '{{ $branding->primary_color ?? "#0f172a" }}',
                        secondary: '{{ $branding->secondary_color ?? "#334155" }}',
                        accent: '{{ $branding->accent_color ?? "#3b82f6" }}',
                    }
                }
            }
        }
    </script>
    
    <style type="text/tailwindcss">
        @layer utilities {
            .btn-primary {
                @apply bg-primary text-white font-semibold py-2 px-4 rounded hover:opacity-90 transition-opacity;
            }
            .btn-secondary {
                @apply bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded hover:bg-gray-50 transition-colors;
            }
        }
    </style>
    
    @if($seo->analytics_id)
        <!-- Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id={{ $seo->analytics_id }}"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '{{ $seo->analytics_id }}');
        </script>
    @endif
    
    @if($seo->google_verification)
        <meta name="google-site-verification" content="{{ $seo->google_verification }}">
    @endif
</head>
<body class="antialiased font-sans text-gray-900 bg-gray-50 flex flex-col min-h-screen">
    
    @include('marketing.partials._nav')

    <main class="flex-grow">
        @yield('content')
    </main>

    @include('marketing.partials._footer')

</body>
</html>
