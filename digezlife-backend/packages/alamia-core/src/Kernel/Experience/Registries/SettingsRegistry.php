<?php

namespace Alamia\Core\Kernel\Experience\Registries;

use Alamia\Core\Kernel\Experience\Builders\SettingsBuilder;

class SettingsRegistry extends BaseRegistry
{
    public function tenant(): SettingsBuilder
    {
        return new SettingsBuilder($this, 'tenant');
    }

    public function platform(): SettingsBuilder
    {
        return new SettingsBuilder($this, 'platform');
    }
}
