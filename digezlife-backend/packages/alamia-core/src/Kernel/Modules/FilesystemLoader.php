<?php

namespace Alamia\Core\Kernel\Modules;

use Alamia\Core\Kernel\Alamia;
use Composer\Semver\Semver;
use RuntimeException;

class FilesystemLoader implements ModuleLoader
{
    public function __construct(
        protected string $modulesPath
    ) {}

    public function load(ModuleRegistry $registry): void
    {
        if (! is_dir($this->modulesPath)) {
            return;
        }

        $directories = array_filter(glob($this->modulesPath.'/*'), 'is_dir');

        foreach ($directories as $dir) {
            $manifestPath = $dir.'/module.json';

            if (file_exists($manifestPath)) {
                $content = file_get_contents($manifestPath);
                $data = json_decode($content, true);

                if (is_array($data)) {
                    $manifest = ModuleManifest::fromArray($data);

                    // Validate kernel version requirement if provided
                    $kernelRequirement = $manifest->requires['kernel'] ?? null;
                    if ($kernelRequirement && ! Semver::satisfies(Alamia::version(), $kernelRequirement)) {
                        throw new RuntimeException(sprintf(
                            'Module [%s] requires Kernel version %s, but %s is installed.',
                            $manifest->name,
                            $kernelRequirement,
                            Alamia::version()
                        ));
                    }

                    $registry->register($manifest);
                }
            }
        }
    }
}
