<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Volt\Volt;
use Spatie\Activitylog\Models\Activity;
use Tests\TestCase;

class AuditLogsComponentTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_view_audit_logs(): void
    {
        Activity::create([
            'log_name' => 'default',
            'description' => 'System started successfully',
            'properties' => ['foo' => 'bar'],
        ]);

        Volt::test('audit-logs.index')
            ->assertSee('System started successfully')
            ->assertSee('foo')
            ->assertSee('bar');
    }
}
