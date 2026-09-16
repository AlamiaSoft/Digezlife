<?php

use Livewire\Volt\Component;

new class extends Component {
    public function getNotificationsProperty()
    {
        return auth()->user()->notifications;
    }

    public function markAsRead($notificationId)
    {
        auth()->user()->notifications()->where('id', $notificationId)->update(['read_at' => now()]);
    }

    public function markAllAsRead()
    {
        auth()->user()->unreadNotifications->markAsRead();
    }
    
    public function deleteNotification($notificationId)
    {
        auth()->user()->notifications()->where('id', $notificationId)->delete();
    }
}; ?>

<div>
    <div class="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow text-gray-800">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Notifications</h2>
            @if($this->notifications->whereNull('read_at')->count() > 0)
                <button wire:click="markAllAsRead" class="text-sm text-blue-500 hover:text-blue-700">
                    Mark all as read
                </button>
            @endif
        </div>

        @if($this->notifications->isEmpty())
            <div class="p-8 text-center text-gray-500 border rounded bg-gray-50">
                You have no notifications.
            </div>
        @else
            <div class="space-y-4">
                @foreach($this->notifications as $notification)
                    <div class="p-4 border rounded flex justify-between items-center {{ is_null($notification->read_at) ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200' }}">
                        <div>
                            <p class="font-semibold {{ is_null($notification->read_at) ? 'text-blue-800' : 'text-gray-800' }}">
                                {{ $notification->data['message'] ?? 'New notification' }}
                            </p>
                            <p class="text-xs text-gray-500 mt-1">{{ $notification->created_at->diffForHumans() }}</p>
                        </div>
                        <div class="flex space-x-2">
                            @if(is_null($notification->read_at))
                                <button wire:click="markAsRead('{{ $notification->id }}')" class="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded text-gray-700">
                                    Mark Read
                                </button>
                            @endif
                            <button wire:click="deleteNotification('{{ $notification->id }}')" class="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 rounded text-red-700">
                                Delete
                            </button>
                        </div>
                    </div>
                @endforeach
            </div>
        @endif
    </div>
</div>
