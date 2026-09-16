<?php

namespace Alamia\Core\Kernel\Experience\Registries;

use Alamia\Core\Kernel\Experience\Builders\ResourceBuilder;

class ResourceRegistry extends BaseRegistry
{
    public function tenant(): ResourceBuilder
    {
        return new ResourceBuilder($this, 'tenant');
    }

    public function platform(): ResourceBuilder
    {
        return new ResourceBuilder($this, 'platform');
    }
}
