<?php

namespace Alamia\Core\Platform\Discovery;

use Alamia\Core\Platform\Contracts\DiscoveryProvider;
use Illuminate\Support\Collection;

class PlatformDiscoveryService
{
    /**
     * @var array<DiscoveryProvider>
     */
    protected array $providers = [];

    /**
     * @param iterable<DiscoveryProvider> $providers
     */
    public function __construct(iterable $providers = [])
    {
        foreach ($providers as $provider) {
            $this->providers[] = $provider;
        }
    }

    /**
     * Discover all components, optionally filtered by search string.
     *
     * @return Collection<\Alamia\Core\Platform\DTOs\PlatformComponent>
     */
    public function discoverAll(?string $search = null): Collection
    {
        $components = collect();

        foreach ($this->providers as $provider) {
            $components = $components->merge($provider->discover());
        }

        if ($search) {
            $search = strtolower($search);
            $components = $components->filter(function ($component) use ($search) {
                return str_contains(strtolower($component->name), $search) ||
                       str_contains(strtolower($component->description), $search);
            });
        }

        return $components->values();
    }

    /**
     * Discover components by type.
     *
     * @return Collection<\Alamia\Core\Platform\DTOs\PlatformComponent>
     */
    public function discoverByType(string $type, ?string $search = null): Collection
    {
        $components = collect();

        foreach ($this->providers as $provider) {
            if ($provider->type() === $type) {
                $components = $components->merge($provider->discover());
            }
        }

        if ($search) {
            $search = strtolower($search);
            $components = $components->filter(function ($component) use ($search) {
                return str_contains(strtolower($component->name), $search) ||
                       str_contains(strtolower($component->description), $search);
            });
        }

        return $components->values();
    }

    /**
     * Get a summary of the platform's discovered components.
     *
     * @return array<string, int>
     */
    public function summary(): array
    {
        $all = $this->discoverAll();

        return [
            'domains' => $all->where('type', 'core_domain')->count(),
            'modules' => $all->where('type', 'business_module')->count(),
            'active_modules' => $all->where('type', 'business_module')->where('active', true)->count(),
        ];
    }
}
