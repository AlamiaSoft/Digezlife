<?php

use Alamia\Core\Controllers\API\V1\SuperAdmin\AnalyticsController;
use Alamia\Core\Controllers\API\V1\SuperAdmin\AuditLogController;
use Alamia\Core\Controllers\API\V1\SuperAdmin\ImpersonationController;
use Alamia\Core\Controllers\API\V1\SuperAdmin\SettingsController;
use Alamia\Core\Controllers\API\V1\SuperAdmin\SuperAdminController;
use Alamia\Core\Controllers\API\V1\SuperAdmin\TenantController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Super Admin Routes
|--------------------------------------------------------------------------
|
| These routes are for super admin functionality only. They require
| super admin authentication and permissions.
|
*/

Route::middleware(['auth:sanctum', 'super_admin'])->group(function () {

    // Tenant Management
    Route::prefix('tenants')->name('super-admin.tenants.')->group(function () {
        Route::get('/', [TenantController::class, 'index'])->name('index');
        Route::post('/', [TenantController::class, 'store'])->name('store');
        Route::get('/{tenant}', [TenantController::class, 'show'])->name('show');
        Route::patch('/{tenant}', [TenantController::class, 'update'])->name('update');
        Route::delete('/{tenant}', [TenantController::class, 'destroy'])->name('destroy');

        // Tenant Actions
        Route::post('/{tenant}/suspend', [TenantController::class, 'suspend'])->name('suspend');
        Route::post('/{tenant}/activate', [TenantController::class, 'activate'])->name('activate');
        Route::post('/{tenant}/cancel', [TenantController::class, 'cancel'])->name('cancel');
    });

    // Super Admin Management
    Route::prefix('admins')->name('super-admin.admins.')->group(function () {
        Route::get('/', [SuperAdminController::class, 'index'])->name('index');
        Route::post('/', [SuperAdminController::class, 'store'])->name('store');
        Route::get('/{admin}', [SuperAdminController::class, 'show'])->name('show');
        Route::patch('/{admin}', [SuperAdminController::class, 'update'])->name('update');
        Route::delete('/{admin}', [SuperAdminController::class, 'destroy'])->name('destroy');

        // Super Admin Actions
        Route::post('/{admin}/suspend', [SuperAdminController::class, 'suspend'])->name('suspend');
        Route::post('/{admin}/activate', [SuperAdminController::class, 'activate'])->name('activate');
    });

    // System Analytics
    Route::prefix('analytics')->name('super-admin.analytics.')->group(function () {
        Route::get('/overview', [AnalyticsController::class, 'overview'])->name('overview');
        Route::get('/tenants', [AnalyticsController::class, 'tenants'])->name('tenants');
        Route::get('/users', [AnalyticsController::class, 'users'])->name('users');
        Route::get('/revenue', [AnalyticsController::class, 'revenue'])->name('revenue');
    });

    // System Settings
    Route::prefix('settings')->name('super-admin.settings.')->group(function () {
        Route::get('/', [SettingsController::class, 'index'])->name('index');
        Route::patch('/', [SettingsController::class, 'update'])->name('update');
    });

    // User Impersonation
    Route::prefix('impersonate')->name('super-admin.impersonate.')->group(function () {
        Route::post('/stop', [ImpersonationController::class, 'stop'])->name('stop');
        Route::post('/{user}', [ImpersonationController::class, 'start'])->name('start');
    });

    // Audit Logs
    Route::prefix('audit-logs')->name('super-admin.audit-logs.')->group(function () {
        Route::get('/', [AuditLogController::class, 'index'])->name('index');
        Route::get('/{log}', [AuditLogController::class, 'show'])->name('show');
    });
});
