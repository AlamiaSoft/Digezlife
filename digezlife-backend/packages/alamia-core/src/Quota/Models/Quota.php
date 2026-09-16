<?php

namespace Alamia\Core\Quota\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $key
 * @property int $limit
 * @property string|null $context_type
 * @property int|null $context_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Model|Eloquent|null $context
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Quota newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Quota newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Quota query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Quota whereContextId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Quota whereContextType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Quota whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Quota whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Quota whereKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Quota whereLimit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Quota whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class Quota extends Model
{
    protected $table = 'alamia_quotas';

    protected $fillable = [
        'key',
        'limit', // -1 for unlimited
        'context_type',
        'context_id',
    ];

    protected $casts = [
        'limit' => 'integer',
    ];

    public function context(): MorphTo
    {
        return $this->morphTo();
    }
}
