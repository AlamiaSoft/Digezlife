<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Livewire\Volt\Volt;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Here you can register the tenant routes for your application.
| These routes are loaded by the TenantRouteServiceProvider.
|
| Feel free to customize them however you want. Good luck!
|
*/

Route::middleware([
    'web',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {

    Volt::route('/login', 'login')->name('login');

    Route::middleware('auth')->group(function () {
        Volt::route('/dashboard', 'dashboard')->name('dashboard');
        Volt::route('/roles', 'roles')->name('roles');
        Volt::route('/settings/general', 'settings.general')->name('settings.general');
        Volt::route('/notifications', 'notifications.index')->name('notifications.index');
        Volt::route('/audit-logs', 'audit-logs.index')->name('audit-logs.index');
    });

});
