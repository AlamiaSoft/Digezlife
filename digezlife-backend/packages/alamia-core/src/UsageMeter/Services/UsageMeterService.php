<?php

namespace Alamia\Core\UsageMeter\Services;

use Alamia\Core\UsageMeter\Models\Usage;
use Illuminate\Database\Eloquent\Model;

class UsageMeterService
{
    public function get(string $key, ?Model $context = null): int
    {
        $query = Usage::where('key', $key);

        if ($context) {
            $query->where('context_type', $context->getMorphClass())
                ->where('context_id', $context->getKey());
        } else {
            $query->whereNull('context_type')
                ->whereNull('context_id');
        }

        $usage = $query->first();

        return $usage ? $usage->value : 0;
    }

    public function increment(string $key, int $amount = 1, ?Model $context = null): Usage
    {
        return $this->adjust($key, $amount, $context);
    }

    public function decrement(string $key, int $amount = 1, ?Model $context = null): Usage
    {
        return $this->adjust($key, -$amount, $context);
    }

    public function set(string $key, int $value, ?Model $context = null): Usage
    {
        $attributes = ['key' => $key];

        if ($context) {
            $attributes['context_type'] = $context->getMorphClass();
            $attributes['context_id'] = $context->getKey();
        } else {
            $attributes['context_type'] = null;
            $attributes['context_id'] = null;
        }

        return Usage::updateOrCreate($attributes, ['value' => $value]);
    }

    protected function adjust(string $key, int $amount, ?Model $context = null): Usage
    {
        $attributes = ['key' => $key];

        if ($context) {
            $attributes['context_type'] = $context->getMorphClass();
            $attributes['context_id'] = $context->getKey();
        } else {
            $attributes['context_type'] = null;
            $attributes['context_id'] = null;
        }

        $usage = Usage::firstOrCreate($attributes, ['value' => 0]);
        $usage->increment('value', $amount);

        return $usage->fresh();
    }
}
