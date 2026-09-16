<?php

namespace Alamia\Core\Workflow\Providers;

use Alamia\Core\Workflow\Services\WorkflowService;
use Illuminate\Support\ServiceProvider;

class WorkflowServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(WorkflowService::class, fn ($app) => new WorkflowService);
    }

    public function boot(): void
    {
        //
    }
}
