<?php

namespace Alamia\Core\FeatureFlags\Services;

use Laravel\Pennant\Feature;

class FeatureService
{
    /**
     * Determine if the given feature is enabled for the current scope.
     */
    public function enabled(string $feature): bool
    {
        return Feature::active($feature);
    }

    /**
     * Determine if the given feature is enabled for a specific scope.
     */
    public function enabledFor(mixed $scope, string $feature): bool
    {
        return Feature::for($scope)->active($feature);
    }

    /**
     * Enable the given feature for the current scope.
     */
    public function enable(string $feature): void
    {
        Feature::activate($feature);
    }

    /**
     * Enable the given feature for a specific scope.
     */
    public function enableFor(mixed $scope, string $feature): void
    {
        Feature::for($scope)->activate($feature);
    }

    /**
     * Disable the given feature for the current scope.
     */
    public function disable(string $feature): void
    {
        Feature::deactivate($feature);
    }

    /**
     * Disable the given feature for a specific scope.
     */
    public function disableFor(mixed $scope, string $feature): void
    {
        Feature::for($scope)->deactivate($feature);
    }
}
