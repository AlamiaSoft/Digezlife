<?php

namespace Alamia\Core\Integrations\Facades;

use Alamia\Core\Integrations\Services\Webhooks\WebhookManager;
use Illuminate\Support\Facades\Facade;

class Webhooks extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return WebhookManager::class;
    }
}
