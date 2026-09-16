<?php

namespace Alamia\Core\Notifications\Services;

use Illuminate\Support\Facades\Notification as LaravelNotification;

class NotificationService
{
    /**
     * Send the given notification to the given notifiable entities.
     */
    public function send(mixed $notifiables, mixed $notification): void
    {
        // TODO: In the future, check user notification preferences here before sending.
        LaravelNotification::send($notifiables, $notification);
    }

    /**
     * Send the given notification immediately.
     */
    public function sendNow(mixed $notifiables, mixed $notification): void
    {
        LaravelNotification::sendNow($notifiables, $notification);
    }
}
