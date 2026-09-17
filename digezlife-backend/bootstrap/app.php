<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');
        $middleware->append(\App\Http\Middleware\SecurityHeadersMiddleware::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Stancl\Tenancy\Exceptions\TenantCouldNotBeIdentifiedByPathException $e, $request) {
            if ($request->expectsJson() || $request->is('*/api/*') || $request->is('api/*')) {
                return response()->json([
                    'errors' => [
                        [
                            'status' => '404',
                            'code' => 'TENANT_NOT_FOUND',
                            'title' => 'Tenant Not Found',
                            'detail' => 'The requested household tenant could not be found.',
                        ],
                    ],
                    'jsonapi' => ['version' => '1.1'],
                ], 404);
            }
            abort(404, 'Household not found.');
        });
    })->create();
