<?php

namespace Alamia\Core\Kernel\Experience\Builders;

use Alamia\Core\Kernel\Experience\DTOs\NavigationItem;
use Alamia\Core\Kernel\Experience\Registries\NavigationRegistry;

class NavigationBuilder
{
    protected NavigationRegistry $registry;
    protected string $scope;

    public function __construct(NavigationRegistry $registry, string $scope)
    {
        $this->registry = $registry;
        $this->scope = $scope;
    }

    public function add(NavigationItem $item): static
    {
        $this->registry->registerInScope($this->scope, $item);
        return $this;
    }

    public function create(string $id, string $label): NavigationItem
    {
        $item = NavigationItem::make($id, $label);
        $this->add($item);
        return $item;
    }
}
