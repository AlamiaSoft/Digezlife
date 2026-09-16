<?php

namespace Alamia\Core\Configuration\Facades;

use Alamia\Core\Configuration\Services\ConfigurationService;
use Illuminate\Support\Facades\Facade;

class Configuration extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return ConfigurationService::class;
    }
}
