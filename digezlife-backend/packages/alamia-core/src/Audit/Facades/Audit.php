<?php

namespace Alamia\Core\Audit\Facades;

use Alamia\Core\Audit\Services\AuditService;
use Illuminate\Support\Facades\Facade;

class Audit extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return AuditService::class;
    }
}
