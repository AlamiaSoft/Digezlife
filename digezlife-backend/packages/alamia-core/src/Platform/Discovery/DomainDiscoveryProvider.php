<?php

namespace Alamia\Core\Platform\Discovery;

use Alamia\Core\Kernel\Alamia;
use Alamia\Core\Platform\Contracts\DiscoveryProvider;
use Alamia\Core\Platform\Contracts\DomainDefinition;
use Alamia\Core\Platform\DTOs\PlatformComponent;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class DomainDiscoveryProvider implements DiscoveryProvider
{
    /**
     * Directories to exclude from domain discovery (infrastructure folders).
     */
    protected array $excludedDirectories = [
        'Commands', 'Controllers', 'Database', 'Http', 'Middleware',
        'Models', 'Providers', 'Routes', 'Services', 'Support', 'Traits',
        'Shared', 'Developer', 'Platform',
    ];

    public function discover(): Collection
    {
        $components = collect();
        $corePath = base_path('packages/alamia-core/src');

        if (! File::isDirectory($corePath)) {
            return $components;
        }

        $directories = File::directories($corePath);

        foreach ($directories as $dir) {
            $domainName = basename($dir);

            if (in_array($domainName, $this->excludedDirectories)) {
                continue;
            }

            $components->push($this->buildComponent($domainName, $dir));
        }

        return $components;
    }

    public function type(): string
    {
        return 'core_domain';
    }

    protected function buildComponent(string $domainName, string $dir): PlatformComponent
    {
        // Check if there is a provider that implements DomainDefinition
        $providerClass = "Alamia\\Core\\{$domainName}\\Providers\\{$domainName}ServiceProvider";

        if (class_exists($providerClass)) {
            $reflection = new \ReflectionClass($providerClass);
            if ($reflection->implementsInterface(DomainDefinition::class)) {
                /** @var DomainDefinition $provider */
                $provider = new $providerClass(app());
                
                return new PlatformComponent(
                    id: Str::kebab($domainName),
                    name: $provider->name(),
                    type: $this->type(),
                    description: $provider->description(),
                    version: $provider->version(),
                    active: true,
                    toggleable: false,
                    author: 'Alamia Core',
                    path: $dir,
                    metadata: [
                        'capabilities' => $provider->capabilities(),
                    ]
                );
            }
        }

        // Graceful fallback for inferred domains
        return new PlatformComponent(
            id: Str::kebab($domainName),
            name: $domainName,
            type: $this->type(),
            description: "Core platform domain for {$domainName} capabilities.",
            version: Alamia::version(),
            active: true,
            toggleable: false,
            author: 'Alamia Core',
            path: $dir,
            metadata: [
                'capabilities' => [],
            ]
        );
    }
}
