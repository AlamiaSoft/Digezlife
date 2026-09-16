<?php

namespace Alamia\Core\Notifications\Providers;

use Alamia\Core\Notifications\Services\NotificationService;
use Illuminate\Support\ServiceProvider;

class NotificationsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(NotificationService::class, fn ($app) => new NotificationService);
    }

    public function boot(): void
    {
        //
    }
}
