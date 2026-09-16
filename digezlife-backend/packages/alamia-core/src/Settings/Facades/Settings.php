<?php

namespace Alamia\Core\Settings\Facades;

use Alamia\Core\Settings\Services\SettingsService;
use Illuminate\Support\Facades\Facade;

class Settings extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return SettingsService::class;
    }
}
