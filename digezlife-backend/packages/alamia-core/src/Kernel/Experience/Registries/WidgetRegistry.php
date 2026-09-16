<?php

namespace Alamia\Core\Kernel\Experience\Registries;

use Alamia\Core\Kernel\Experience\Builders\WidgetBuilder;

class WidgetRegistry extends BaseRegistry
{
    public function tenant(): WidgetBuilder
    {
        return new WidgetBuilder($this, 'tenant');
    }

    public function platform(): WidgetBuilder
    {
        return new WidgetBuilder($this, 'platform');
    }
}
