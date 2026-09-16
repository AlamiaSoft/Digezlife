<?php

namespace Alamia\Core\Platform\Lifecycle;

use Alamia\Core\Platform\Services\DeveloperToolsService;
use Illuminate\Support\Facades\File;

class ModuleLifecycleService
{
    public function __construct(
        protected DeveloperToolsService $developerTools
    ) {}

    public function enable(string $modulePath): void
    {
        $this->setActiveState($modulePath, 1);
        $this->developerTools->clearCaches();
    }

    public function disable(string $modulePath): void
    {
        $this->setActiveState($modulePath, 0);
        $this->developerTools->clearCaches();
    }

    public function isEnabled(string $modulePath): bool
    {
        $manifestPath = "{$modulePath}/module.json";
        
        if (! File::exists($manifestPath)) {
            return false;
        }

        $manifest = json_decode(File::get($manifestPath), true);
        
        return (bool) ($manifest['active'] ?? true);
    }

    protected function setActiveState(string $modulePath, int $state): void
    {
        $manifestPath = "{$modulePath}/module.json";
        
        if (! File::exists($manifestPath)) {
            throw new \RuntimeException("Module manifest not found at {$manifestPath}");
        }

        $manifest = json_decode(File::get($manifestPath), true);
        
        if (! is_array($manifest)) {
            throw new \RuntimeException("Invalid module manifest at {$manifestPath}");
        }

        $manifest['active'] = $state;

        File::put(
            $manifestPath,
            json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
    }
}
