<?php

namespace Alamia\Core\Integrations\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $context_type
 * @property int $context_id
 * @property string $name
 * @property string $url
 * @property string|null $secret
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Model|Eloquent $context
 * @property-read Collection<int, WebhookDelivery> $deliveries
 * @property-read int|null $deliveries_count
 * @property-read Collection<int, WebhookSubscription> $subscriptions
 * @property-read int|null $subscriptions_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookEndpoint newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookEndpoint newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookEndpoint query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookEndpoint whereContextId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookEndpoint whereContextType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookEndpoint whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookEndpoint whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookEndpoint whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookEndpoint whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookEndpoint whereSecret($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookEndpoint whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookEndpoint whereUrl($value)
 *
 * @mixin \Eloquent
 */
class WebhookEndpoint extends Model
{
    protected $table = 'alamia_webhook_endpoints';

    protected $fillable = [
        'context_type',
        'context_id',
        'name',
        'url',
        'secret',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function context(): MorphTo
    {
        return $this->morphTo();
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(WebhookSubscription::class, 'endpoint_id');
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(WebhookDelivery::class, 'endpoint_id');
    }
}
