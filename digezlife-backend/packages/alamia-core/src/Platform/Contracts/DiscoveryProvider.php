<?php

namespace Alamia\Core\Platform\Contracts;

use Illuminate\Support\Collection;

interface DiscoveryProvider
{
    /**
     * Discover platform components.
     *
     * @return Collection<\Alamia\Core\Platform\DTOs\PlatformComponent>
     */
    public function discover(): Collection;

    /**
     * Get the type of components this provider discovers.
     * (e.g., 'core_domain', 'business_module', 'marketplace', 'application')
     */
    public function type(): string;
}
