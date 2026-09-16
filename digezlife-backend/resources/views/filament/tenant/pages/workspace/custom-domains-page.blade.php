<x-filament-panels::page>
    <x-filament::section>
        <x-slot name="heading">Configured Domains</x-slot>

        <div class="divide-y divide-gray-200 dark:divide-white/10">
            @forelse($domains as $domain)
                <div class="py-4 flex justify-between items-center">
                    <div>
                        <span class="font-mono text-sm text-gray-900 dark:text-white">{{ $domain['domain'] }}</span>
                        @if($domain['is_primary'] ?? false)
                            <x-filament::badge color="success" size="sm" class="ml-2 inline">Primary</x-filament::badge>
                        @endif
                    </div>
                    <div class="flex gap-2">
                        <x-filament::badge color="success">SSL Active</x-filament::badge>
                        <x-filament::badge color="info">Connected</x-filament::badge>
                    </div>
                </div>
            @empty
                <div class="py-4 text-center text-gray-500">
                    No domains configured for this workspace.
                </div>
            @endforelse
        </div>
    </x-filament::section>

    <x-filament::section>
        <x-slot name="heading">How to point custom domain</x-slot>
        <div class="prose dark:prose-invert text-sm max-w-none">
            <p>To use a custom domain, configure your DNS settings with your domain provider:</p>
            <ol>
                <li>Create a <strong>CNAME</strong> record for your subdomain pointing to: <code>proxy.alamia.io</code></li>
                <li>Or create an <strong>A</strong> record pointing to: <code>192.168.1.1</code></li>
                <li>Domain changes can take up to 24 hours to propagate worldwide.</li>
            </ol>
        </div>
    </x-filament::section>
</x-filament-panels::page>
