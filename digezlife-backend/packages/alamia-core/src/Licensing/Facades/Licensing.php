<?php

namespace Alamia\Core\Licensing\Facades;

use Alamia\Core\Licensing\Services\LicensingService;
use Illuminate\Support\Facades\Facade;

class Licensing extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return LicensingService::class;
    }
}
