<?php

namespace Alamia\Core\Billing\Providers;

use Alamia\Core\Billing\Services\BillingService;
use Illuminate\Support\ServiceProvider;
use Alamia\Core\Platform\Contracts\DomainDefinition;

class BillingServiceProvider extends ServiceProvider implements DomainDefinition
{
    public function provides(): array
    {
        return ['billing', BillingEngine::class];
    }

    public function name(): string
    {
        return 'Billing';
    }

    public function description(): string
    {
        return 'Subscription plans, payment processing, invoicing, and metered billing for SaaS.';
    }

    public function capabilities(): array
    {
        return ['subscriptions', 'payments', 'invoicing'];
    }

    public function version(): string
    {
        return '1.0.0';
    }

    public function register(): void
    {
        $this->app->singleton(BillingService::class, fn ($app) => new BillingService);
    }

    public function boot(): void
    {
        //
    }
}
