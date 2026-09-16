<?php

namespace App\Models\Marketing;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class NavItem extends Model
{
    protected $fillable = ['label', 'url', 'location', 'target', 'sort_order', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }

    public function scopeHeader(Builder $query): Builder
    {
        return $query->where('location', 'header')->active();
    }

    public function scopeFooter(Builder $query): Builder
    {
        return $query->where('location', 'footer')->active();
    }
}
