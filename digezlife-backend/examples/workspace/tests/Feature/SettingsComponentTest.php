<?php

namespace Tests\Feature;

use App\Settings\GeneralSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Volt\Volt;
use Tests\TestCase;

class SettingsComponentTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_update_general_settings(): void
    {
        $settings = app(GeneralSettings::class);
        $this->assertEquals('Acme Corp', $settings->site_name);

        Volt::test('settings.general')
            ->set('siteName', 'New Site Name')
            ->set('supportEmail', 'new@example.com')
            ->call('save')
            ->assertHasNoErrors()
            ->assertSee('Settings updated successfully');

        $settings->refresh();
        $this->assertEquals('New Site Name', $settings->site_name);
        $this->assertEquals('new@example.com', $settings->support_email);
    }
}
