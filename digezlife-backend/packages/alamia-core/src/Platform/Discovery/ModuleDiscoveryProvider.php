<?php

namespace Alamia\Core\Platform\Discovery;

use Alamia\Core\Platform\Contracts\DiscoveryProvider;
use Alamia\Core\Platform\DTOs\PlatformComponent;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;

class ModuleDiscoveryProvider implements DiscoveryProvider
{
    public function discover(): Collection
    {
        $components = collect();
        $modulesPath = base_path('modules');

        if (! File::isDirectory($modulesPath)) {
            return $components;
        }

        $directories = File::directories($modulesPath);

        foreach ($directories as $dir) {
            $manifestPath = "{$dir}/module.json";
            
            if (! File::exists($manifestPath)) {
                continue;
            }

            $manifest = json_decode(File::get($manifestPath), true);
            
            if (is_array($manifest)) {
                $components->push($this->buildComponent($manifest, $dir));
            }
        }

        return $components;
    }

    public function type(): string
    {
        return 'business_module';
    }

    /**
     * @param array<string, mixed> $manifest
     */
    protected function buildComponent(array $manifest, string $dir): PlatformComponent
    {
        return new PlatformComponent(
            id: $manifest['alias'] ?? basename($dir),
            name: $manifest['name'] ?? basename($dir),
            type: $this->type(),
            description: $manifest['description'] ?? 'No description provided.',
            version: $manifest['version'] ?? '1.0.0',
            active: (bool) ($manifest['active'] ?? true),
            toggleable: true,
            author: $manifest['author'] ?? null,
            path: $dir,
            metadata: [
                'permissions_count' => count($manifest['permissions'] ?? []),
                'dependencies' => array_keys($manifest['requires'] ?? []),
                'tenant_aware' => (bool) ($manifest['tenant_aware'] ?? true),
                'feature_flags' => $manifest['feature_flags'] ?? [],
                'billing_features' => $manifest['billing_features'] ?? [],
            ]
        );
    }
}
