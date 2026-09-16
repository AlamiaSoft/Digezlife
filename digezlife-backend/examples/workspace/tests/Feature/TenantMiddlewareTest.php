<?php

namespace Tests\Feature;

use Alamia\Core\Tenant\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_dashboard_redirects_unauthenticated(): void
    {
        $tenantId = 'acme_'.\Illuminate\Support\Str::random(6);

        $tenant = Tenant::create([
            'id' => $tenantId,
            'name' => 'Acme Corp',
        ]);

        $tenant->domains()->create([
            'domain' => $tenantId.'.localhost',
        ]);

        $response = $this->get('http://'.$tenantId.'.localhost/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_tenant_dashboard_accessible_when_authenticated(): void
    {
        $tenantId = 'acme_'.\Illuminate\Support\Str::random(6);

        $tenant = Tenant::create([
            'id' => $tenantId,
            'name' => 'Acme Corp',
        ]);

        $tenant->domains()->create([
            'domain' => $tenantId.'.localhost',
        ]);

        $user = User::factory()->create();

        // In Alamia Core, users must be attached to the tenant to access it.
        // Let's test basic auth first. The dashboard blade uses auth()->user().
        $response = $this->actingAs($user)->get('http://'.$tenantId.'.localhost/dashboard');

        $response->assertStatus(200)
            ->assertSee('Welcome back')
            ->assertSee('Tenant Context Active')
            ->assertSee('Acme Corp');
    }
}
