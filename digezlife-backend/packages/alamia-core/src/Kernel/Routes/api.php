<?php

use Alamia\Core\Controllers\API\V1\Auth\AuthController;
use Alamia\Core\Controllers\API\V1\Auth\OAuthController;
use Alamia\Core\Controllers\API\V1\Central\ProfileController;
use Alamia\Core\Controllers\API\V1\Central\TenantSelectionController;
use Alamia\Core\Controllers\API\V1\System\HealthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Central API Routes
|--------------------------------------------------------------------------
|
| These routes are for central functionality: authentication, tenant
| selection, and user profile management. They are not tenant-scoped.
|
*/

// System Health & Information
Route::get('/health', [HealthController::class, 'index'])->name('health');
Route::get('/ping', [HealthController::class, 'ping'])->name('ping');
Route::get('/version', [HealthController::class, 'version'])->name('version');
// Route::get('/status', [HealthController::class, 'status'])->name('status');

// System Status (authenticated)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/status', [HealthController::class, 'status'])->name('status');
});

// Authentication Routes
Route::prefix('auth')->name('auth.')->group(function () {
    // Public routes with rate limiting
    Route::post('/register', [AuthController::class, 'register'])
        ->middleware('throttle:10,1') // 10 attempts per minute
        ->name('register');
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1') // 5 attempts per minute
        ->name('login');
    Route::post('/super-admin/login', [AuthController::class, 'superAdminLogin'])
        ->middleware('throttle:5,1') // 5 attempts per minute
        ->name('super-admin.login');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
        ->middleware('throttle:3,1') // 3 attempts per minute
        ->name('forgot-password');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])
        ->middleware('throttle:5,1') // 5 attempts per minute
        ->name('reset-password');

    // Email verification
    Route::get('/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware(['signed'])
        ->name('verify-email');

    // OAuth routes
    Route::prefix('oauth')->name('oauth.')->group(function () {
        Route::get('/{provider}', [OAuthController::class, 'redirect'])->name('redirect');
        Route::get('/{provider}/callback', [OAuthController::class, 'callback'])->name('callback');

        // Authenticated OAuth routes
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/{provider}/connect', [OAuthController::class, 'connect'])->name('connect');
            Route::delete('/{provider}/disconnect', [OAuthController::class, 'disconnect'])->name('disconnect');
        });
    });

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        Route::post('/refresh', [AuthController::class, 'refresh'])->name('refresh');
        Route::get('/me', [AuthController::class, 'me'])->name('me');
    });
});

// Tenant Selection & Management (for authenticated users)
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('tenants')->name('tenants.')->group(function () {
        Route::get('/', [TenantSelectionController::class, 'index'])->name('index');
        Route::get('/{tenant}', [TenantSelectionController::class, 'show'])->name('show');
        Route::post('/{tenant}/switch', [TenantSelectionController::class, 'switch'])->name('switch');
    });

    // User Profile
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'show'])->name('show');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::post('/change-password', [ProfileController::class, 'changePassword'])->name('change-password');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });

    // Household & Family Members Management
    Route::prefix('household')->name('household.')->group(function () {
        Route::get('/members', [\App\Http\Controllers\HouseholdController::class, 'index'])->name('members.index');
        Route::post('/invitations', [\App\Http\Controllers\HouseholdController::class, 'invite'])->name('invitations.create');
        Route::delete('/invitations/{id}', [\App\Http\Controllers\HouseholdController::class, 'cancelInvite'])->name('invitations.cancel');
        Route::delete('/members/{userId}', [\App\Http\Controllers\HouseholdController::class, 'removeMember'])->name('members.remove');
        Route::post('/join', [\App\Http\Controllers\HouseholdController::class, 'join'])->name('join');
        Route::get('/my-capabilities', [\App\Http\Controllers\HouseholdController::class, 'myCapabilities'])->name('my-capabilities');
        Route::get('/activity', [\App\Http\Controllers\HouseholdController::class, 'activityLog'])->name('activity');
        Route::put('/members/{userId}/role', [\App\Http\Controllers\HouseholdController::class, 'updateMemberRole'])->name('members.role.update');
        Route::get('/members/{userId}/capabilities', [\App\Http\Controllers\HouseholdController::class, 'getMemberCapabilities'])->name('members.capabilities.show');
        Route::put('/members/{userId}/capabilities', [\App\Http\Controllers\HouseholdController::class, 'updateMemberCapabilities'])->name('members.capabilities.update');
        Route::get('/snapshot', [\App\Http\Controllers\HouseholdController::class, 'snapshot'])->name('snapshot');
        Route::get('/activity-feed-settings', [\App\Http\Controllers\HouseholdController::class, 'feedSettings'])->name('activity-feed.settings');
        Route::post('/activity-feed/clear', [\App\Http\Controllers\HouseholdController::class, 'clearActivityFeed'])->name('activity-feed.clear');
        Route::post('/activity-feed/dismiss', [\App\Http\Controllers\HouseholdController::class, 'dismissActivity'])->name('activity-feed.dismiss');
        Route::put('/', [\App\Http\Controllers\HouseholdController::class, 'update'])->name('update');
        Route::post('/redeem-code', [\App\Http\Controllers\HouseholdController::class, 'redeemPromoCode'])->name('redeem-code');
    });

});
