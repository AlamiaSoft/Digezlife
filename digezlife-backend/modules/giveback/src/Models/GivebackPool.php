<?php

declare(strict_types=1);

namespace Modules\Giveback\Models;

use Alamia\Core\Shared\Traits\HasExternalId;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GivebackPool extends Model
{
    use HasExternalId;

    protected $fillable = [
        'external_id',
        'period_start',
        'period_end',
        'eligible_revenue_minor',
        'percentage_bp',
        'pool_amount_minor',
        'currency',
        'allocation_config',
        'status',
        'created_by',
    ];

    protected $casts = [
        'period_start'           => 'datetime',
        'period_end'             => 'datetime',
        'eligible_revenue_minor' => 'integer',
        'percentage_bp'          => 'integer',
        'pool_amount_minor'      => 'integer',
        'allocation_config'      => 'array',
    ];

    protected static function getExternalIdPrefix(): string
    {
        return 'GBP';
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
