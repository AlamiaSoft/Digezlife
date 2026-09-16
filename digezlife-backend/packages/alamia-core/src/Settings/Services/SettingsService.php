<?php

namespace Alamia\Core\Settings\Services;

class SettingsService
{
    /**
     * Resolve a typed settings class from Spatie Laravel Settings.
     * Business modules should use this instead of injecting the settings class directly,
     * so that the platform can intercept or override settings resolution in the future.
     */
    public function resolve(string $settingsClass): mixed
    {
        return app($settingsClass);
    }
}
