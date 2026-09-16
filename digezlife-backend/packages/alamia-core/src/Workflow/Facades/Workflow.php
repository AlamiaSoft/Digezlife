<?php

namespace Alamia\Core\Workflow\Facades;

use Alamia\Core\Workflow\Services\WorkflowService;
use Illuminate\Support\Facades\Facade;

class Workflow extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return WorkflowService::class;
    }
}
