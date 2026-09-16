<?php

namespace Alamia\Core\Kernel\Experience\Builders;

use Alamia\Core\Kernel\Experience\DTOs\LayoutDefinition;
use Alamia\Core\Kernel\Experience\Registries\LayoutRegistry;

class LayoutBuilder
{
    protected LayoutRegistry $registry;
    protected string $scope;

    public function __construct(LayoutRegistry $registry, string $scope)
    {
        $this->registry = $registry;
        $this->scope = $scope;
    }

    public function add(LayoutDefinition $layout): static
    {
        $this->registry->registerInScope($this->scope, $layout);
        return $this;
    }

    public function create(string $id, string $type): LayoutDefinition
    {
        $layout = LayoutDefinition::make($id, $type);
        $this->add($layout);
        return $layout;
    }
}
