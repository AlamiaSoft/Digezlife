<?php

use Illuminate\Support\Facades\Route;
use Modules\Grocery\Http\Controllers\GroceryController;
use Stancl\Tenancy\Middleware\InitializeTenancyByPath;

Route::middleware([
    InitializeTenancyByPath::class,
    'auth:sanctum',
    'check_tenant_status',
    'user_belongs_to_tenant',
])->prefix('{tenant}/api/v1/grocery')->group(function () {
    Route::get('/lists', [GroceryController::class, 'indexLists']);
    Route::post('/lists', [GroceryController::class, 'storeList']);
    Route::get('/lists/{list}', [GroceryController::class, 'showList']);
    Route::post('/lists/{list}/items', [GroceryController::class, 'storeItem']);
    Route::patch('/lists/{list}/items/{item}/toggle', [GroceryController::class, 'toggleItem']);
    Route::delete('/lists/{list}/items/{item}', [GroceryController::class, 'destroyItem']);
    Route::get('/lists/{list}/whatsapp', [GroceryController::class, 'exportWhatsApp']);
});
