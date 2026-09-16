<?php

namespace Alamia\Core\Kernel\Modules;

interface ModuleLoader
{
    /**
     * Load modules into the given registry.
     */
    public function load(ModuleRegistry $registry): void;
}
