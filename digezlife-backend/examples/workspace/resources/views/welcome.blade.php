<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Alamia Workspace Demo</title>
        <script src="https://cdn.tailwindcss.com"></script>
        @livewireStyles
    </head>
    <body class="antialiased bg-gray-100 min-h-screen">
        <div class="relative flex items-top justify-center min-h-screen bg-gray-100 sm:items-center py-4 sm:pt-0">
            <div class="max-w-6xl mx-auto sm:px-6 lg:px-8 w-full">
                <div class="flex justify-center pt-8 sm:justify-start sm:pt-0 mb-8">
                    <h1 class="text-4xl font-bold text-gray-900">Alamia Workspace Demo</h1>
                </div>

                <div class="bg-white p-8 overflow-hidden shadow sm:rounded-lg">
                    <livewire:create-tenant />
                </div>
            </div>
        </div>
        @livewireScripts
    </body>
</html>
