<?php

namespace Alamia\Core\Integrations\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $endpoint_id
 * @property string $event_name
 * @property array<array-key, mixed> $payload
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, WebhookAttempt> $attempts
 * @property-read int|null $attempts_count
 * @property-read WebhookEndpoint $endpoint
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookDelivery newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookDelivery newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookDelivery query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookDelivery whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookDelivery whereEndpointId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookDelivery whereEventName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookDelivery whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookDelivery wherePayload($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookDelivery whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookDelivery whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class WebhookDelivery extends Model
{
    protected $table = 'alamia_webhook_deliveries';

    protected $fillable = [
        'endpoint_id',
        'event_name',
        'payload',
        'status',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public function endpoint(): BelongsTo
    {
        return $this->belongsTo(WebhookEndpoint::class, 'endpoint_id');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(WebhookAttempt::class, 'delivery_id');
    }
}
