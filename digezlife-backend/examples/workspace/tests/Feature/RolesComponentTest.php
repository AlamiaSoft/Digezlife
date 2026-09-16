<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Volt\Volt;
use Tests\TestCase;

class RolesComponentTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_role(): void
    {
        Volt::test('roles')
            ->set('name', 'content_editor')
            ->set('displayName', 'Content Editor')
            ->set('description', 'Can edit all tenant content')
            ->call('createRole')
            ->assertHasNoErrors()
            ->assertSee('content_editor');

        $this->assertDatabaseHas('roles', [
            'name' => 'content_editor',
        ]);
    }
}
