<?php

namespace Alamia\Core\Integrations\Services\Webhooks;

use Alamia\Core\Integrations\Models\WebhookDelivery;
use Alamia\Core\Integrations\Models\WebhookEndpoint;
use Illuminate\Database\Eloquent\Model;
use Spatie\WebhookServer\WebhookCall;

class WebhookManager
{
    /**
     * Dispatch a domain event to all subscribed endpoints for a specific context.
     *
     * @param  Model  $context
     */
    public function dispatch(string $eventName, array $payload, $context): void
    {
        // 1. Find all active endpoints for this context
        $endpoints = WebhookEndpoint::where('context_type', $context->getMorphClass())
            ->where('context_id', $context->getKey())
            ->where('is_active', true)
            ->whereHas('subscriptions', function ($query) use ($eventName) {
                $query->where('event_name', $eventName);
            })
            ->get();

        foreach ($endpoints as $endpoint) {
            // 2. Log delivery intent
            $delivery = WebhookDelivery::create([
                'endpoint_id' => $endpoint->id,
                'event_name' => $eventName,
                'payload' => $payload,
                'status' => 'pending',
            ]);

            // 3. Dispatch via Spatie Webhook Server
            // Internally, Spatie handles queues, retries, and backoffs based on config.
            $call = WebhookCall::create()
                ->url($endpoint->url)
                ->payload($payload)
                ->useSecret($endpoint->secret ?? '')
                ->meta(['delivery_id' => $delivery->id]);

            $call->dispatch();
        }
    }
}
