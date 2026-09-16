<?php

namespace Alamia\Core\Billing\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Plan newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Plan newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Plan query()
 *
 * @property-read Collection<int, Product> $products
 * @property-read int|null $products_count
 * @property-read Collection<int, Model> $tenants
 * @property-read int|null $tenants_count
 *
 * @mixin \Eloquent
 */
class Plan extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'price',
        'currency',
        'interval',
        'is_active',
    ];

    protected $casts = [
        'price' => 'integer',
        'is_active' => 'boolean',
    ];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'plan_product');
    }

    public function tenants(): HasMany
    {
        return $this->hasMany(config('tenant-engine.models.tenant'));
    }
}
