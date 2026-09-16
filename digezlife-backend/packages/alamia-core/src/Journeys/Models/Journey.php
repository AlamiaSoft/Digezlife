<?php

namespace Alamia\Core\Journeys\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $key
 * @property string|null $description
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, JourneyStep> $steps
 * @property-read int|null $steps_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Journey newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Journey newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Journey query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Journey whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Journey whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Journey whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Journey whereKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Journey whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Journey whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class Journey extends Model
{
    protected $table = 'alamia_journeys';

    protected $fillable = [
        'name',
        'key',
        'description',
    ];

    public function steps(): HasMany
    {
        return $this->hasMany(JourneyStep::class);
    }
}
