<?php

namespace Modules\Hisab\Models;

use Alamia\Core\Shared\Traits\HasExternalId;
use Alamia\Core\Tenant\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HisabDebt extends Model
{
    use BelongsToTenant, HasExternalId, HasFactory, SoftDeletes;

    protected $fillable = [
        'external_id',
        'tenant_id',
        'direction',
        'person_name',
        'person_phone',
        'amount',
        'paid_amount',
        'due_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'amount' => 'float',
        'paid_amount' => 'float',
        'due_date' => 'date',
    ];

    protected static function getExternalIdPrefix(): string
    {
        return 'DBT';
    }

    public function getRemainingAmountAttribute(): float
    {
        return max(0, $this->amount - $this->paid_amount);
    }
}
