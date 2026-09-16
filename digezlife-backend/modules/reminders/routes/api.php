<?php

use Illuminate\Support\Facades\Route;
use Modules\Reminders\Http\Controllers\ReminderController;
use Stancl\Tenancy\Middleware\InitializeTenancyByPath;

Route::middleware([
    InitializeTenancyByPath::class,
    'auth:sanctum',
    'check_tenant_status',
    'user_belongs_to_tenant',
])->prefix('{tenant}/api/v1/reminders')->group(function () {
    Route::get('/', [ReminderController::class, 'index']);
    Route::post('/', [ReminderController::class, 'store']);
    Route::get('/{reminder}', [ReminderController::class, 'show']);
    Route::patch('/{reminder}', [ReminderController::class, 'update']);
    Route::patch('/{reminder}/toggle', [ReminderController::class, 'toggleComplete']);
    Route::delete('/{reminder}', [ReminderController::class, 'destroy']);
});
