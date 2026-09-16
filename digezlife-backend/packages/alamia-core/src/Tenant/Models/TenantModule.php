<?php

namespace Alamia\Core\Tenant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantModule extends Model
{
    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        $this->connection = config('tenancy.central_connection', 'sqlite');
    }

    protected $table = 'tenant_modules';

    protected $fillable = [
        'tenant_id',
        'module',
        'enabled',
        'licensed',
        'settings',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'licensed' => 'boolean',
        'settings' => 'array',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }
}
