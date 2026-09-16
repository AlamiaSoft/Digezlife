<?php

namespace Alamia\Core\ApiGateway\Providers;

use Alamia\Core\ApiGateway\Services\ApiGatewayService;
use Illuminate\Support\ServiceProvider;

class ApiGatewayServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ApiGatewayService::class, fn ($app) => new ApiGatewayService);
    }

    public function boot(): void
    {
        //
    }
}
