<?php

namespace App\Models\Marketing;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class FooterSection extends Model
{
    protected $fillable = ['title', 'links', 'sort_order'];

    protected $casts = [
        'links' => 'array',
    ];

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order');
    }
}
