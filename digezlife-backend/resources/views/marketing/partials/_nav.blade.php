@php
    $navItems = \App\Models\Marketing\NavItem::header()->get();
    $branding = \App\Models\Marketing\Branding::singleton();
@endphp
<nav class="bg-white border-b border-gray-100 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex items-center">
                <a href="{{ route('home') }}" class="flex-shrink-0 flex items-center gap-2">
                    @if($branding->getFirstMediaUrl('logo'))
                        <img class="h-8 w-auto" src="{{ $branding->getFirstMediaUrl('logo') }}" alt="{{ $branding->app_name }}">
                    @else
                        <span class="font-bold text-xl text-primary">{{ $branding->app_name }}</span>
                    @endif
                </a>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
                @foreach($navItems as $item)
                    <a href="{{ url($item->url) }}" target="{{ $item->target }}" class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                        {{ $item->label }}
                    </a>
                @endforeach
            </div>
            <div class="hidden sm:flex items-center space-x-4">
                @auth
                    @php
                        $authUser = auth()->user();
                        $userTenant = $authUser?->tenants()->first();
                        $dashboardUrl = $userTenant 
                            ? url('/app/' . $userTenant->id) 
                            : url('/admin');
                        $dashboardLabel = $userTenant ? 'My Workspace' : 'Admin Dashboard';
                    @endphp
                    <a href="{{ $dashboardUrl }}" class="btn-primary text-sm px-4 py-2">{{ $dashboardLabel }}</a>
                    <form method="POST" action="{{ route('logout') }}" class="inline">
                        @csrf
                        <button type="submit" class="text-sm font-medium text-gray-500 hover:text-gray-900 ml-2">Sign out</button>
                    </form>
                @else
                    <a href="{{ route('login') }}" class="text-sm font-medium text-gray-500 hover:text-gray-900">Log in</a>
                    <a href="{{ route('register') }}" class="btn-primary text-sm px-4 py-2">Get Started</a>
                @endauth
            </div>
            
            <!-- Mobile menu button -->
            <div class="flex items-center sm:hidden">
                <button type="button" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary" aria-expanded="false">
                    <span class="sr-only">Open main menu</span>
                    <!-- Icon when menu is closed. -->
                    <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</nav>
