<?php

namespace Alamia\Core\Kernel\Experience\Registries;

use Alamia\Core\Kernel\Experience\Builders\SearchBuilder;

class SearchRegistry extends BaseRegistry
{
    public function tenant(): SearchBuilder
    {
        return new SearchBuilder($this, 'tenant');
    }

    public function platform(): SearchBuilder
    {
        return new SearchBuilder($this, 'platform');
    }
}
