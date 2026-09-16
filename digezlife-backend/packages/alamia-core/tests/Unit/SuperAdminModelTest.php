<?php

namespace Alamia\Core\Tests\Unit;

use Alamia\Core\Authorization\Models\SuperAdmin;
use Alamia\Core\Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;

class SuperAdminModelTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function super_admin_has_external_id_on_creation(): void
    {
        $admin = SuperAdmin::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $this->assertNotNull($admin->external_id);
        $this->assertStringStartsWith('SAD_', $admin->external_id);
    }

    /** @test */
    public function super_admin_can_check_if_active(): void
    {
        $admin = SuperAdmin::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'status' => 'active',
        ]);

        $this->assertTrue($admin->isActive());
        $this->assertFalse($admin->isSuspended());
    }

    /** @test */
    public function super_admin_can_be_suspended(): void
    {
        $admin = SuperAdmin::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'status' => 'active',
        ]);

        $admin->suspend();

        $this->assertTrue($admin->isSuspended());
        $this->assertEquals('suspended', $admin->status);
    }

    /** @test */
    public function super_admin_can_update_last_login(): void
    {
        $admin = SuperAdmin::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $admin->updateLastLogin('192.168.1.1');

        $this->assertNotNull($admin->last_login_at);
        $this->assertEquals('192.168.1.1', $admin->last_login_ip);
    }

    /** @test */
    public function super_admin_can_impersonate_when_enabled(): void
    {
        config(['tenant-engine.super_admin.impersonation.enabled' => true]);

        $admin = SuperAdmin::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'status' => 'active',
        ]);

        $this->assertTrue($admin->canImpersonate());
    }

    /** @test */
    public function super_admin_cannot_impersonate_when_suspended(): void
    {
        config(['tenant-engine.super_admin.impersonation.enabled' => true]);

        $admin = SuperAdmin::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'status' => 'suspended',
        ]);

        $this->assertFalse($admin->canImpersonate());
    }
}
