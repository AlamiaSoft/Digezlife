<?php

namespace Alamia\Core\Kernel\Experience\Builders;

use Alamia\Core\Kernel\Experience\DTOs\CommandDefinition;
use Alamia\Core\Kernel\Experience\Registries\CommandRegistry;
use Closure;

class CommandBuilder
{
    protected CommandRegistry $registry;
    protected string $scope;

    public function __construct(CommandRegistry $registry, string $scope)
    {
        $this->registry = $registry;
        $this->scope = $scope;
    }

    public function add(CommandDefinition $command): static
    {
        $this->registry->registerInScope($this->scope, $command);
        return $this;
    }

    public function create(string $id, string $label, string|Closure $action): CommandDefinition
    {
        $command = CommandDefinition::make($id, $label, $action);
        $this->add($command);
        return $command;
    }
}
