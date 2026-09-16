<?php

namespace Alamia\Core\Kernel\Experience\Registries;

use Alamia\Core\Kernel\Experience\Builders\NavigationBuilder;

class NavigationRegistry extends BaseRegistry
{
    public function tenant(): NavigationBuilder
    {
        return new NavigationBuilder($this, 'tenant');
    }

    public function platform(): NavigationBuilder
    {
        return new NavigationBuilder($this, 'platform');
    }
}
