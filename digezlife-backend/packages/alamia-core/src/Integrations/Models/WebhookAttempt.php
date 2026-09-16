<?php

namespace Alamia\Core\Integrations\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $delivery_id
 * @property int|null $response_status
 * @property string|null $response_body
 * @property bool $is_successful
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read WebhookDelivery $delivery
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookAttempt newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookAttempt newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookAttempt query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookAttempt whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookAttempt whereDeliveryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookAttempt whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookAttempt whereIsSuccessful($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookAttempt whereResponseBody($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookAttempt whereResponseStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WebhookAttempt whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class WebhookAttempt extends Model
{
    protected $table = 'alamia_webhook_attempts';

    protected $fillable = [
        'delivery_id',
        'response_status',
        'response_body',
        'is_successful',
    ];

    protected $casts = [
        'is_successful' => 'boolean',
    ];

    public function delivery(): BelongsTo
    {
        return $this->belongsTo(WebhookDelivery::class, 'delivery_id');
    }
}
