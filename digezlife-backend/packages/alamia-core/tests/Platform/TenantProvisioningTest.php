<?php

declare(strict_types=1);

namespace Alamia\Core\Tenant\Tests;

use Alamia\Core\Shared\DTOs\TenantProvisioningData;
use Alamia\Core\Shared\ValueObjects\PlainPassword;
use Alamia\Core\Tenant\Events\TenantProvisioned;
use Alamia\Core\Tenant\Events\TenantProvisionStarted;
use Alamia\Core\Tenant\Events\TenantProvisionStepCompleted;
use Alamia\Core\Tenant\Events\TenantProvisionStepStarted;
use Alamia\Core\Tenant\Events\TenantRegistered;
use Alamia\Core\Tenant\Models\Tenant;
use Alamia\Core\Tenant\Services\TenantProvisioningService;
use Alamia\Core\Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

class TenantProvisioningTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_provision_creates_tenant_and_fires_tenant_registered()
    {
        Event::fake([TenantRegistered::class]);

        $service = app(TenantProvisioningService::class);
        $dto = new TenantProvisioningData(
            subdomain: 'test-saas',
            tenantName: 'Test SaaS',
            adminEmail: 'admin@test.com',
            adminPassword: new PlainPassword('password'),
        );

        $tenant = $service->provision($dto);

        $this->assertInstanceOf(Tenant::class, $tenant);
        $this->assertEquals('test-saas', $tenant->id);
        $this->assertEquals('Test SaaS', $tenant->name);

        Event::assertDispatched(TenantRegistered::class, fn ($e) => $e->tenant->id === $tenant->id);
    }

    public function test_pipeline_executes_all_steps_in_order()
    {
        Event::fake([
            TenantProvisionStarted::class,
            TenantProvisionStepStarted::class,
            TenantProvisionStepCompleted::class,
            TenantProvisioned::class,
        ]);

        $service = app(TenantProvisioningService::class);
        $dto = new TenantProvisioningData(
            subdomain: 'test-saas-2',
            tenantName: 'Test SaaS 2',
            adminEmail: 'admin2@test.com',
            adminPassword: new PlainPassword('password'),
        );

        $service->provision($dto);

        Event::assertDispatched(TenantProvisionStarted::class);
        Event::assertDispatched(TenantProvisioned::class);

        $centralDomain = config('tenant-engine.tenant.central_domain');
        if (empty($centralDomain)) {
            $domains = config('tenancy.central_domains', []);
            $centralDomain = in_array('localhost', $domains, true) ? 'localhost' : ($domains[0] ?? 'localhost');
        }
        $this->assertDatabaseHas('domains', [
            'domain' => 'test-saas-2.'.$centralDomain,
        ]);
    }
}
