<?php

namespace Alamia\Core\Kernel;

class Version
{
    public const VERSION = '1.0.0';

    public static function version(): string
    {
        return self::VERSION;
    }
}
