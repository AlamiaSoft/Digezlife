<?php

namespace Alamia\Core\Notifications\Facades;

use Alamia\Core\Notifications\Services\NotificationService;
use Illuminate\Support\Facades\Facade;

class Notification extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return NotificationService::class;
    }
}
