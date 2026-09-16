<?php

namespace Alamia\Core\Integrations\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $endpoint_id
 * @property string $event_name
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read WebhookEndpoint $endpoint
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookSubscription newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookSubscription newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookSubscription query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookSubscription whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookSubscription whereEndpointId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookSubscription whereEventName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookSubscription whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookSubscription whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class WebhookSubscription extends Model
{
    protected $table = 'alamia_webhook_subscriptions';

    protected $fillable = [
        'endpoint_id',
        'event_name',
    ];

    public function endpoint(): BelongsTo
    {
        return $this->belongsTo(WebhookEndpoint::class, 'endpoint_id');
    }
}
