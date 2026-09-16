<?php

namespace Alamia\Core\UsageMeter\Facades;

use Alamia\Core\UsageMeter\Services\UsageMeterService;
use Illuminate\Support\Facades\Facade;

class UsageMeter extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return UsageMeterService::class;
    }
}
