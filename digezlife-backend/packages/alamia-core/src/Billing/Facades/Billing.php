<?php

namespace Alamia\Core\Billing\Facades;

use Alamia\Core\Billing\Services\BillingService;
use Illuminate\Support\Facades\Facade;

class Billing extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return BillingService::class;
    }
}
