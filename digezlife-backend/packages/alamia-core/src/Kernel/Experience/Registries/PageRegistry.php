<?php

namespace Alamia\Core\Kernel\Experience\Registries;

use Alamia\Core\Kernel\Experience\Builders\PageBuilder;

class PageRegistry extends BaseRegistry
{
    public function tenant(): PageBuilder
    {
        return new PageBuilder($this, 'tenant');
    }

    public function platform(): PageBuilder
    {
        return new PageBuilder($this, 'platform');
    }
}
