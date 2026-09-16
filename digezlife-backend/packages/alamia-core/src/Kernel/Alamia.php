<?php

namespace Alamia\Core\Kernel;

class Alamia
{
    /**
     * Get the version number of the Alamia platform.
     */
    public static function version(): string
    {
        return Version::version();
    }
}
