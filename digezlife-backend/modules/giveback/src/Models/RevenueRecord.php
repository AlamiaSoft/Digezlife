<?php

declare(strict_types=1);

namespace Modules\Giveback\Models;

use Alamia\Core\Shared\Traits\HasExternalId;
use Illuminate\Database\Eloquent\Model;

class RevenueRecord extends Model
{
    use HasExternalId;

    protected $fillable = [
        'external_id',
        'source',
        'source_reference',
        'gross_amount_minor',
        'net_amount_minor',
        'currency',
        'occurred_at',
        'status',
        'metadata',
    ];

    protected $casts = [
        'gross_amount_minor' => 'integer',
        'net_amount_minor'   => 'integer',
        'occurred_at'        => 'datetime',
        'metadata'           => 'array',
    ];

    protected static function getExternalIdPrefix(): string
    {
        return 'REV';
    }
}
