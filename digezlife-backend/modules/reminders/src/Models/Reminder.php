<?php

namespace Modules\Reminders\Models;

use Alamia\Core\Shared\Traits\HasExternalId;
use Alamia\Core\Tenant\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reminder extends Model
{
    use BelongsToTenant, HasExternalId, HasFactory, SoftDeletes;

    protected $fillable = [
        'external_id',
        'tenant_id',
        'title',
        'description',
        'category',
        'due_at',
        'recurrence_rule',
        'is_completed',
        'completed_at',
        'notification_channels',
    ];

    protected $casts = [
        'due_at' => 'datetime',
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
        'notification_channels' => 'array',
    ];

    protected static function getExternalIdPrefix(): string
    {
        return 'RMD';
    }
}
