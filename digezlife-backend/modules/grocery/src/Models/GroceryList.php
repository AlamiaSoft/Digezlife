<?php

namespace Modules\Grocery\Models;

use Alamia\Core\Shared\Traits\HasExternalId;
use Alamia\Core\Tenant\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroceryList extends Model
{
    use BelongsToTenant, HasExternalId, HasFactory, SoftDeletes;

    protected $fillable = [
        'external_id',
        'tenant_id',
        'name',
        'icon',
        'color',
        'is_archived',
    ];

    protected $casts = [
        'is_archived' => 'boolean',
    ];

    protected static function getExternalIdPrefix(): string
    {
        return 'GLS';
    }

    public function items(): HasMany
    {
        return $this->hasMany(GroceryItem::class, 'grocery_list_id')->orderBy('is_checked')->orderBy('sort_order');
    }
}
