<?php

namespace App\Providers;

use Alamia\Core\Tenant\Events\TenantProvisioned;
use App\Listeners\AssignWorkspaceRoles;
use App\Listeners\CreateWorkspaceOwner;
use App\Listeners\SendWelcomeNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        TenantProvisioned::class => [
            CreateWorkspaceOwner::class,
            AssignWorkspaceRoles::class,
            SendWelcomeNotification::class,
        ],
    ];
}
