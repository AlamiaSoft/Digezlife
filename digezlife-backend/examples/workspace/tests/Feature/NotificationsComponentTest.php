<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\Notification;
use Livewire\Volt\Volt;
use Tests\TestCase;

class SampleNotification extends Notification
{
    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'message' => 'This is a sample notification',
        ];
    }
}

class NotificationsComponentTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_view_and_manage_notifications(): void
    {
        $user = User::factory()->create();

        $user->notify(new SampleNotification);
        $this->assertCount(1, $user->notifications);

        Volt::actingAs($user)
            ->test('notifications.index')
            ->assertSee('This is a sample notification')
            ->call('markAllAsRead');

        $this->assertCount(0, $user->fresh()->unreadNotifications);

        Volt::actingAs($user)
            ->test('notifications.index')
            ->call('deleteNotification', $user->notifications->first()->id);

        $this->assertCount(0, $user->fresh()->notifications);
    }
}
