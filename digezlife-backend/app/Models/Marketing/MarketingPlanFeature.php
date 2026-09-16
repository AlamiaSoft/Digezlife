<?php

namespace App\Models\Marketing;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MarketingPlanFeature extends Model
{
    protected $fillable = ['marketing_plan_id', 'feature', 'included', 'sort_order'];

    protected $casts = [
        'included' => 'boolean',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(MarketingPlan::class, 'marketing_plan_id');
    }
}
