<?php

namespace Alamia\Core\Platform\Contracts;

interface MarketplaceProvider extends DiscoveryProvider
{
    /**
     * Check if the marketplace provider is currently available and accessible.
     */
    public function isAvailable(): bool;
}
