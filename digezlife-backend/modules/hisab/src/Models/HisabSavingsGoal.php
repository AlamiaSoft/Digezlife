<?php

namespace Modules\Hisab\Models;

use Alamia\Core\Shared\Traits\HasExternalId;
use Alamia\Core\Tenant\Models\Traits\BelongsToTenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class HisabSavingsGoal extends Model
{
    use BelongsToTenant, HasExternalId, HasFactory, SoftDeletes;

    protected $fillable = [
        'external_id',
        'tenant_id',
        'name',
        'category',
        'target_amount',
        'current_amount',
        'target_date',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'target_amount' => 'float',
        'current_amount' => 'float',
        'target_date' => 'date',
    ];

    protected $appends = [
        'progress_percentage',
        'remaining_amount',
    ];

    protected static function getExternalIdPrefix(): string
    {
        return 'SGV';
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function contributions(): HasMany
    {
        return $this->hasMany(HisabSavingsContribution::class, 'goal_id');
    }

    public function getProgressPercentageAttribute(): int
    {
        if ($this->target_amount <= 0) {
            return 100;
        }

        return (int) min(100, round(($this->current_amount / $this->target_amount) * 100));
    }

    public function getRemainingAmountAttribute(): float
    {
        return (float) max(0, $this->target_amount - $this->current_amount);
    }
}
