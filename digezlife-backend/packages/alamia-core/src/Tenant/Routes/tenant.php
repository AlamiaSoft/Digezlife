<?php

use Alamia\Core\Controllers\API\V1\Tenant\AnalyticsController;
use Alamia\Core\Controllers\API\V1\Tenant\AuditLogController;
use Alamia\Core\Controllers\API\V1\Tenant\PermissionController;
use Alamia\Core\Controllers\API\V1\Tenant\RoleController;
use Alamia\Core\Controllers\API\V1\Tenant\SettingsController;
use Alamia\Core\Controllers\API\V1\Tenant\UserController;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByPath;

/*
|--------------------------------------------------------------------------
| Tenant-Scoped Routes
|--------------------------------------------------------------------------
|
| These routes are scoped to a specific tenant. They use Stancl's
| InitializeTenancyByPath middleware to identify and switch to the
| correct tenant context.
|
*/

Route::middleware([
    InitializeTenancyByPath::class,
    'auth:sanctum',
    'check_tenant_status',
    'user_belongs_to_tenant',
])->group(function () {

    // Tenant Settings
    Route::prefix('settings')->name('tenant.settings.')->group(function () {
        Route::get('/', [SettingsController::class, 'index'])->name('index');
        Route::patch('/', [SettingsController::class, 'update'])->name('update');
    });

    // User Management
    Route::prefix('users')->name('tenant.users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::get('/{user}', [UserController::class, 'show'])->name('show');
        Route::patch('/{user}', [UserController::class, 'update'])->name('update');
        Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');

        // User Actions
        Route::post('/{user}/invite', [UserController::class, 'invite'])->name('invite');
        Route::post('/{user}/resend-invitation', [UserController::class, 'resendInvitation'])->name('resend-invitation');
    });

    // Role Management
    Route::middleware('tenant_admin')->prefix('roles')->name('tenant.roles.')->group(function () {
        Route::get('/', [RoleController::class, 'index'])->name('index');
        Route::post('/', [RoleController::class, 'store'])->name('store');
        Route::get('/{role}', [RoleController::class, 'show'])->name('show');
        Route::patch('/{role}', [RoleController::class, 'update'])->name('update');
        Route::delete('/{role}', [RoleController::class, 'destroy'])->name('destroy');

        // Role Actions
        Route::post('/{role}/assign-permissions', [RoleController::class, 'assignPermissions'])->name('assign-permissions');
    });

    // Permission Management
    Route::prefix('permissions')->name('tenant.permissions.')->group(function () {
        Route::get('/', [PermissionController::class, 'index'])->name('index');
        Route::post('/', [PermissionController::class, 'store'])->name('store');
        Route::get('/{permission}', [PermissionController::class, 'show'])->name('show');
        Route::patch('/{permission}', [PermissionController::class, 'update'])->name('update');
        Route::delete('/{permission}', [PermissionController::class, 'destroy'])->name('destroy');
    });

    // Tenant Analytics
    Route::prefix('analytics')->name('tenant.analytics.')->group(function () {
        Route::get('/overview', [AnalyticsController::class, 'overview'])->name('overview');
        Route::get('/users', [AnalyticsController::class, 'users'])->name('users');
        Route::get('/activity', [AnalyticsController::class, 'activity'])->name('activity');
    });

    // Tenant Audit Logs
    Route::prefix('audit-logs')->name('tenant.audit-logs.')->group(function () {
        Route::get('/', [AuditLogController::class, 'index'])->name('index');
        Route::get('/{log}', [AuditLogController::class, 'show'])->name('show');
    });
});
