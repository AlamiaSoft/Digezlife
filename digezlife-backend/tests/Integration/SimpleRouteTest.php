<?php

test('test simple route', function () {
    $tenantId = 'acme_'.uniqid();

    // Register a simple route
    Illuminate\Support\Facades\Route::get('/{tenant}/api/v1/test', fn () => 'success');

    $response = test()->get("/{$tenantId}/api/v1/test");

    expect($response->status())->toBe(200);
});
