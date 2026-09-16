<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    @php
        $branding = \App\Models\Marketing\Branding::singleton();
    @endphp
    
    <title>@yield('title', config('app.name'))</title>

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />

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
                        accent: '{{ $branding->accent_color ?? "#3b82f6" }}',
                    }
                }
            }
        }
    </script>
</head>
<body class="antialiased font-sans text-gray-900 bg-gray-50">
    <div class="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        @yield('content')
    </div>
</body>
</html>
