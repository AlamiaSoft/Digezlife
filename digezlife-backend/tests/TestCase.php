<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Tests were originally written for multi-database mode,
        // so we bind the DedicatedDatabaseProvisioner instead of the default SharedConnectionProvisioner.
        $this->app->bind(
            \Alamia\Core\Tenant\Contracts\TenantDatabaseProvisioner::class,
            \Alamia\Core\Tenant\Infrastructure\DedicatedDatabaseProvisioner::class
        );
    }
}
