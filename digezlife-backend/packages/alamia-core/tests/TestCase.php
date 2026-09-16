<?php

namespace Alamia\Core\Tests;

use Alamia\Core\Kernel\Providers\AlamiaCoreServiceProvider;
use Alamia\Core\Tenant\Models\Tenant;
use Alamia\Core\Tests\Fixtures\TestUser;
use Laravel\Sanctum\SanctumServiceProvider;
use Orchestra\Testbench\TestCase as Orchestra;
use Stancl\Tenancy\TenancyServiceProvider;

abstract class TestCase extends Orchestra
{
    protected function setUp(): void
    {
        parent::setUp();
    }

    protected function defineDatabaseMigrations()
    {
        $this->loadLaravelMigrations();
        $this->loadMigrationsFrom(realpath(__DIR__.'/Database/Migrations'));
        $this->loadMigrationsFrom(realpath(__DIR__.'/../src/Database/Migrations/central'));
    }

    protected function getPackageProviders($app): array
    {
        return [
            SanctumServiceProvider::class,
            TenancyServiceProvider::class,
            \Alamia\Core\Tenant\Providers\TenancyServiceProvider::class,
            AlamiaCoreServiceProvider::class,
        ];
    }

    protected function getEnvironmentSetUp($app): void
    {

        // Setup Stancl Tenancy config
        $app['config']->set('tenancy.tenant_model', Tenant::class);
        $app['config']->set('tenancy.database.central_connection', null);
        $app['config']->set('tenancy.database.prefix', 'tenant');

        // Setup tenant-engine config
        $app['config']->set('tenant-engine.enabled', true);
        $app['config']->set('tenant-engine.models.user', TestUser::class);
        $app['config']->set('tenant-engine.external_id_prefixes.tenants', 'TNT');
        $app['config']->set('tenant-engine.external_id_prefixes.super_admins', 'SAD');
    }
}
