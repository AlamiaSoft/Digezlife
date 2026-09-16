<?php

namespace App\Models\Marketing;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MarketingPlan extends Model
{
    protected $fillable = [
        'name', 'slug', 'price', 'billing_period', 'description',
        'badge', 'button_text', 'button_url', 'is_popular', 'sort_order', 'is_active',
    ];

    protected $casts = [
        'is_popular' => 'boolean',
        'is_active'  => 'boolean',
    ];

    public function features(): HasMany
    {
        return $this->hasMany(MarketingPlanFeature::class)->orderBy('sort_order');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
