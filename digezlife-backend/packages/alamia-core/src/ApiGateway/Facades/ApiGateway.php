<?php

namespace Alamia\Core\ApiGateway\Facades;

use Alamia\Core\ApiGateway\Services\ApiGatewayService;
use Illuminate\Support\Facades\Facade;

class ApiGateway extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return ApiGatewayService::class;
    }
}
