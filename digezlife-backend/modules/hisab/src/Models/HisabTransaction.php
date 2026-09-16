<?php

namespace Modules\Hisab\Models;

use Alamia\Core\Shared\Traits\HasExternalId;
use Alamia\Core\Tenant\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HisabTransaction extends Model
{
    use BelongsToTenant, HasExternalId, HasFactory, SoftDeletes;

    protected $fillable = [
        'external_id',
        'tenant_id',
        'type',
        'amount',
        'currency',
        'category',
        'payment_method',
        'transaction_date',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'float',
        'transaction_date' => 'date',
    ];

    protected static function getExternalIdPrefix(): string
    {
        return 'TXN';
    }
}
