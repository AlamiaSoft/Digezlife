<?php

use Alamia\Core\Tenant\Models\Tenant;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

test('tenants have isolated data scopes', function () {
    $tenant1 = Tenant::create(['id' => 'tenant1_'.uniqid()]);
    $tenant2 = Tenant::create(['id' => 'tenant2_'.uniqid()]);

    // Insert records scoped to tenant 1
    tenancy()->initialize($tenant1);
    $list1 = \Modules\Grocery\Models\GroceryList::create([
        'name' => 'Tenant 1 Groceries',
    ]);
    expect($list1->tenant_id)->toBe($tenant1->id);

    // Switch to tenant 2
    tenancy()->initialize($tenant2);
    $list2 = \Modules\Grocery\Models\GroceryList::create([
        'name' => 'Tenant 2 Groceries',
    ]);
    expect($list2->tenant_id)->toBe($tenant2->id);

    // Tenant 2 query only returns Tenant 2 lists
    $t2Lists = \Modules\Grocery\Models\GroceryList::all();
    expect($t2Lists)->toHaveCount(1)
        ->and($t2Lists->first()->name)->toBe('Tenant 2 Groceries');

    // Switch back to Tenant 1
    tenancy()->initialize($tenant1);
    $t1Lists = \Modules\Grocery\Models\GroceryList::all();
    expect($t1Lists)->toHaveCount(1)
        ->and($t1Lists->first()->name)->toBe('Tenant 1 Groceries');

    tenancy()->end();
});
