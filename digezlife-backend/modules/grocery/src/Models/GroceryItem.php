<?php

namespace Modules\Grocery\Models;

use Alamia\Core\Shared\Traits\HasExternalId;
use Alamia\Core\Tenant\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroceryItem extends Model
{
    use BelongsToTenant, HasExternalId, HasFactory, SoftDeletes;

    protected $fillable = [
        'external_id',
        'tenant_id',
        'grocery_list_id',
        'name',
        'quantity',
        'unit',
        'category',
        'is_checked',
        'is_recurring',
        'checked_at',
        'sort_order',
        'created_by',
    ];

    protected $casts = [
        'quantity' => 'float',
        'is_checked' => 'boolean',
        'is_recurring' => 'boolean',
        'checked_at' => 'datetime',
        'sort_order' => 'integer',
    ];

    protected static function getExternalIdPrefix(): string
    {
        return 'GIT';
    }

    public function groceryList(): BelongsTo
    {
        return $this->belongsTo(GroceryList::class, 'grocery_list_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }
}
