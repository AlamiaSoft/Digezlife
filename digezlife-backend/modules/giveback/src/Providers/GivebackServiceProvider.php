<?php

declare(strict_types=1);

namespace Modules\Giveback\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Modules\Giveback\Services\RewardLedgerService;
use Modules\Giveback\Services\RewardService;
use Modules\Giveback\Services\ReferralRewardService;

class GivebackServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(RewardLedgerService::class);
        $this->app->singleton(RewardService::class);
        $this->app->singleton(ReferralRewardService::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/../../database/migrations');
        $this->registerRoutes();
    }

    protected function registerRoutes(): void
    {
        if (file_exists(__DIR__ . '/../../routes/api.php')) {
            Route::group([], __DIR__ . '/../../routes/api.php');
        }
    }
}
