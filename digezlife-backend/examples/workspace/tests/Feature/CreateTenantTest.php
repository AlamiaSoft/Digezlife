<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Volt\Volt;
use Tests\TestCase;

class CreateTenantTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_render_tenant_creation_form(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200)
            ->assertSee('Create Workspace');
    }

    public function test_can_create_tenant(): void
    {
        $tenantId = 'acme_'.\Illuminate\Support\Str::random(6);

        Volt::test('create-tenant')
            ->set('name', 'Acme Corporation')
            ->set('subdomain', $tenantId)
            ->call('createTenant')
            ->assertHasNoErrors();

        $this->assertDatabaseHas('tenants', [
            'id' => $tenantId,
            'name' => 'Acme Corporation',
        ]);

        $centralDomain = config('tenancy.central_domains')[0] ?? 'localhost';
        $this->assertDatabaseHas('domains', [
            'domain' => mb_strtolower($tenantId.'.'.$centralDomain),
            'tenant_id' => $tenantId,
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'admin@'.$tenantId.'.com',
        ]);
    }
}
