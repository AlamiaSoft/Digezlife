<?php

namespace Alamia\Core\Kernel\Experience\Registries;

use Alamia\Core\Kernel\Experience\Builders\LayoutBuilder;

class LayoutRegistry extends BaseRegistry
{
    public function tenant(): LayoutBuilder
    {
        return new LayoutBuilder($this, 'tenant');
    }

    public function platform(): LayoutBuilder
    {
        return new LayoutBuilder($this, 'platform');
    }
}
