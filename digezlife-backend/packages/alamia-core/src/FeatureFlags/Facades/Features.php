<?php

namespace Alamia\Core\FeatureFlags\Facades;

use Alamia\Core\FeatureFlags\Services\FeatureService;
use Illuminate\Support\Facades\Facade;

class Features extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return FeatureService::class;
    }
}
