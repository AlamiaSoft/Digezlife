<?php

namespace Alamia\Core\Quota\Facades;

use Alamia\Core\Quota\Services\QuotaService;
use Illuminate\Support\Facades\Facade;

class Quotas extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return QuotaService::class;
    }
}
