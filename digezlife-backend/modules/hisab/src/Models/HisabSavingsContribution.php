<?php

namespace Modules\Hisab\Models;

use Alamia\Core\Tenant\Models\Traits\BelongsToTenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HisabSavingsContribution extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'tenant_id',
        'goal_id',
        'amount',
        'payment_method',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'float',
    ];

    public function goal(): BelongsTo
    {
        return $this->belongsTo(HisabSavingsGoal::class, 'goal_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
