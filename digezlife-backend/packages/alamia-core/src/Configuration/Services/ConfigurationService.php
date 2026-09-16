<?php

namespace Alamia\Core\Configuration\Services;

use Illuminate\Support\Facades\Config;

class ConfigurationService
{
    /**
     * Get the specified configuration value.
     */
    public function get(string $key, mixed $default = null): mixed
    {
        return Config::get("alamia.{$key}", $default);
    }

    /**
     * Determine if the given configuration value exists.
     */
    public function has(string $key): bool
    {
        return Config::has("alamia.{$key}");
    }

    /**
     * Get all Alamia configurations.
     */
    public function all(): array
    {
        return Config::get('alamia', []);
    }
}
