<?php

namespace Alamia\Core\Workflow\Services;

use Illuminate\Support\Facades\Event;

class WorkflowService
{
    /**
     * Dispatch an event through the workflow engine.
     */
    public function dispatch(object|string $event, mixed $payload = []): void
    {
        Event::dispatch($event, $payload);
    }

    /**
     * Register a listener for an event.
     */
    public function listen(string $event, $listener): void
    {
        Event::listen($event, $listener);
    }
}
