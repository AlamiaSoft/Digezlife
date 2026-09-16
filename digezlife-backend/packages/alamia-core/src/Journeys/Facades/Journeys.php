<?php

namespace Alamia\Core\Journeys\Facades;

use Alamia\Core\Journeys\Services\JourneyManager;
use Illuminate\Support\Facades\Facade;

class Journeys extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return JourneyManager::class;
    }
}
