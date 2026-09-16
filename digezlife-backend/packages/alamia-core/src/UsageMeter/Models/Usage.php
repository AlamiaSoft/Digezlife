<?php

namespace Alamia\Core\UsageMeter\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $key
 * @property int $value
 * @property string|null $context_type
 * @property int|null $context_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Model|Eloquent|null $context
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Usage newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Usage newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Usage query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Usage whereContextId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Usage whereContextType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Usage whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Usage whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Usage whereKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Usage whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Usage whereValue($value)
 *
 * @mixin \Eloquent
 */
class Usage extends Model
{
    protected $table = 'alamia_usages';

    protected $fillable = [
        'key',
        'value',
        'context_type',
        'context_id',
    ];

    protected $casts = [
        'value' => 'integer',
    ];

    public function context(): MorphTo
    {
        return $this->morphTo();
    }
}
