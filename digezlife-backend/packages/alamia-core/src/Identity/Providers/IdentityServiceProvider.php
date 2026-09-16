<?php

namespace Alamia\Core\Identity\Providers;

use Illuminate\Support\ServiceProvider;
use Alamia\Core\Platform\Contracts\DomainDefinition;

class IdentityServiceProvider extends ServiceProvider implements DomainDefinition
{
    public function name(): string
    {
        return 'Identity';
    }

    public function description(): string
    {
        return 'User authentication, registration, profile management, and OAuth integration.';
    }

    public function capabilities(): array
    {
        return ['authentication', 'registration', 'profile', 'oauth'];
    }

    public function version(): string
    {
        return '1.0.0';
    }
}
