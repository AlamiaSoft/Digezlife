<?php

use Illuminate\Support\Facades\Route;
use Modules\Hisab\Http\Controllers\HisabController;
use Stancl\Tenancy\Middleware\InitializeTenancyByPath;

Route::middleware([
    InitializeTenancyByPath::class,
    'auth:sanctum',
    'check_tenant_status',
    'user_belongs_to_tenant',
])->prefix('{tenant}/api/v1/hisab')->group(function () {
    Route::get('/transactions', [HisabController::class, 'indexTransactions']);
    Route::post('/transactions', [HisabController::class, 'storeTransaction']);
    Route::put('/transactions/{id}', [HisabController::class, 'updateTransaction']);
    Route::delete('/transactions/{id}', [HisabController::class, 'destroyTransaction']);
    Route::get('/summary', [HisabController::class, 'getSummary']);
    Route::get('/report', [HisabController::class, 'getReport']);

    Route::get('/debts', [HisabController::class, 'indexDebts']);
    Route::post('/debts', [HisabController::class, 'storeDebt']);
    Route::put('/debts/{id}', [HisabController::class, 'updateDebt']);
    Route::delete('/debts/{id}', [HisabController::class, 'destroyDebt']);
    Route::post('/debts/{debt}/settle', [HisabController::class, 'settleDebt']);
    Route::get('/debts/{debt}/whatsapp', [HisabController::class, 'debtWhatsAppReminder']);
});
