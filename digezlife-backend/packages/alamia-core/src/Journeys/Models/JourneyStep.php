<?php

namespace Alamia\Core\Journeys\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $journey_id
 * @property string $key
 * @property string $title
 * @property string|null $description
 * @property int $order
 * @property bool $is_required
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Journey $journey
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyStep newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyStep newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyStep query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyStep whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyStep whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyStep whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyStep whereIsRequired($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyStep whereJourneyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyStep whereKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyStep whereOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyStep whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyStep whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class JourneyStep extends Model
{
    protected $table = 'alamia_journey_steps';

    protected $fillable = [
        'journey_id',
        'key',
        'title',
        'description',
        'order',
        'is_required',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'order' => 'integer',
    ];

    public function journey(): BelongsTo
    {
        return $this->belongsTo(Journey::class);
    }
}
