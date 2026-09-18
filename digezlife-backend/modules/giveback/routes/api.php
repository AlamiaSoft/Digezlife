<?php

use Illuminate\Support\Facades\Route;
use Modules\Giveback\Http\Controllers\ReferralController;
use Modules\Giveback\Http\Controllers\RewardController;

Route::middleware([
    'api',
    'auth:sanctum',
])->prefix('api/v1')->group(function () {
    // User-facing Giveback & Reward endpoints
    Route::get('/rewards/summary', [RewardController::class, 'summary']);
    Route::get('/rewards', [RewardController::class, 'index']);
    Route::get('/rewards/history', [RewardController::class, 'history']);
    Route::post('/rewards/redeem', [RewardController::class, 'redeem']);
    Route::get('/referrals/code', [ReferralController::class, 'code']);
});
