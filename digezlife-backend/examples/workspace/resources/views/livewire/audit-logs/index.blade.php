<?php

use Livewire\Volt\Component;
use Spatie\Activitylog\Models\Activity;
use Livewire\WithPagination;

new class extends Component {
    use WithPagination;

    public function with()
    {
        return [
            'logs' => Activity::latest()->paginate(10),
        ];
    }
}; ?>

<div>
    <div class="max-w-6xl mx-auto mt-8 p-6 bg-white rounded shadow text-gray-800">
        <h2 class="text-2xl font-bold mb-6">Audit Logs</h2>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="p-3 border-b">Timestamp</th>
                        <th class="p-3 border-b">Log Name</th>
                        <th class="p-3 border-b">Description</th>
                        <th class="p-3 border-b">Causer</th>
                        <th class="p-3 border-b">Subject</th>
                        <th class="p-3 border-b">Properties</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($logs as $log)
                        <tr class="border-b last:border-b-0 hover:bg-gray-50">
                            <td class="p-3 whitespace-nowrap">{{ $log->created_at->format('Y-m-d H:i:s') }}</td>
                            <td class="p-3">
                                <span class="bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-1 rounded">
                                    {{ $log->log_name }}
                                </span>
                            </td>
                            <td class="p-3 font-medium">{{ $log->description }}</td>
                            <td class="p-3">
                                @if($log->causer)
                                    {{ $log->causer->name ?? 'User #'.$log->causer_id }}
                                @else
                                    <span class="text-gray-400 italic">System</span>
                                @endif
                            </td>
                            <td class="p-3">
                                @if($log->subject_type)
                                    {{ class_basename($log->subject_type) }} #{{ $log->subject_id }}
                                @else
                                    -
                                @endif
                            </td>
                            <td class="p-3">
                                <pre class="text-xs bg-gray-50 p-2 rounded border overflow-x-auto max-w-xs">{{ json_encode($log->properties, JSON_PRETTY_PRINT) }}</pre>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="p-8 text-center text-gray-500">
                                No audit logs found.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        
        <div class="mt-4">
            {{ $logs->links() }}
        </div>
    </div>
</div>
