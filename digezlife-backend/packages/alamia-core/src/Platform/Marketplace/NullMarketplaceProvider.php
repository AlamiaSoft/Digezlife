<?php

namespace Alamia\Core\Platform\Marketplace;

use Alamia\Core\Platform\Contracts\MarketplaceProvider;
use Illuminate\Support\Collection;

class NullMarketplaceProvider implements MarketplaceProvider
{
    public function isAvailable(): bool
    {
        return false;
    }

    public function discover(): Collection
    {
        return collect();
    }

    public function type(): string
    {
        return 'marketplace';
    }
}
