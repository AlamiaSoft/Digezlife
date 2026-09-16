<?php

namespace Alamia\Core\Kernel\Experience\Registries;

use Alamia\Core\Kernel\Experience\Builders\CommandBuilder;

class CommandRegistry extends BaseRegistry
{
    public function tenant(): CommandBuilder
    {
        return new CommandBuilder($this, 'tenant');
    }

    public function platform(): CommandBuilder
    {
        return new CommandBuilder($this, 'platform');
    }
}
