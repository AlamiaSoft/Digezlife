<?php

namespace Alamia\Core\Kernel\Modules;

class ModuleRegistry
{
    /**
     * @var array<string, ModuleManifest>
     */
    protected array $modules = [];

    public function register(ModuleManifest $manifest): void
    {
        $this->modules[$manifest->id] = $manifest;
    }

    public function get(string $id): ?ModuleManifest
    {
        return $this->modules[$id] ?? null;
    }

    /**
     * @return array<string, ModuleManifest>
     */
    public function all(): array
    {
        return $this->modules;
    }

    /**
     * Retrieve all modules sorted by dependency (topological sort).
     * For now, it returns them in registration order, but we can expand this.
     *
     * @return array<ModuleManifest>
     */
    public function sorted(): array
    {
        return array_values($this->modules);
    }
}
