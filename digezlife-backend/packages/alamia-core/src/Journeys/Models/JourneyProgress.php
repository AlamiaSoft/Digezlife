<?php

namespace Alamia\Core\Journeys\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $journey_id
 * @property int $journey_step_id
 * @property string $context_type
 * @property int $context_id
 * @property string $status
 * @property Carbon|null $completed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Model|Eloquent $context
 * @property-read Journey $journey
 * @property-read JourneyStep $step
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyProgress newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyProgress newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyProgress query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyProgress whereCompletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyProgress whereContextId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyProgress whereContextType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyProgress whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyProgress whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyProgress whereJourneyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyProgress whereJourneyStepId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyProgress whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JourneyProgress whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class JourneyProgress extends Model
{
    protected $table = 'alamia_journey_progress';

    protected $fillable = [
        'journey_id',
        'journey_step_id',
        'context_type',
        'context_id',
        'status',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function journey(): BelongsTo
    {
        return $this->belongsTo(Journey::class);
    }

    public function step(): BelongsTo
    {
        return $this->belongsTo(JourneyStep::class, 'journey_step_id');
    }

    public function context(): MorphTo
    {
        return $this->morphTo();
    }
}
