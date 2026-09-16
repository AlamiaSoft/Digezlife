<?php

namespace Alamia\Core\Quota\Services;

use Alamia\Core\Quota\Models\Quota;
use Illuminate\Database\Eloquent\Model;

class QuotaService
{
    public function getLimit(string $key, ?Model $context = null): int
    {
        $query = Quota::where('key', $key);

        if ($context) {
            $query->where('context_type', $context->getMorphClass())
                ->where('context_id', $context->getKey());
        } else {
            $query->whereNull('context_type')
                ->whereNull('context_id');
        }

        $quota = $query->first();

        // Fallback to default system quota if context specific doesn't exist
        if (! $quota && $context) {
            $quota = Quota::where('key', $key)
                ->whereNull('context_type')
                ->whereNull('context_id')
                ->first();
        }

        return $quota ? $quota->limit : 0; // 0 means no access by default unless defined
    }

    public function setLimit(string $key, int $limit, ?Model $context = null): Quota
    {
        $attributes = ['key' => $key];

        if ($context) {
            $attributes['context_type'] = $context->getMorphClass();
            $attributes['context_id'] = $context->getKey();
        } else {
            $attributes['context_type'] = null;
            $attributes['context_id'] = null;
        }

        return Quota::updateOrCreate($attributes, ['limit' => $limit]);
    }
}
