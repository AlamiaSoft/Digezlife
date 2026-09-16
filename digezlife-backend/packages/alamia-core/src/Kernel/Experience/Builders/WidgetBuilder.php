<?php

namespace Alamia\Core\Kernel\Experience\Builders;

use Alamia\Core\Kernel\Experience\DTOs\WidgetDefinition;
use Alamia\Core\Kernel\Experience\Registries\WidgetRegistry;

class WidgetBuilder
{
    protected WidgetRegistry $registry;
    protected string $scope;

    public function __construct(WidgetRegistry $registry, string $scope)
    {
        $this->registry = $registry;
        $this->scope = $scope;
    }

    public function add(WidgetDefinition $widget): static
    {
        $this->registry->registerInScope($this->scope, $widget);
        return $this;
    }

    public function create(string $id, string $class): WidgetDefinition
    {
        $widget = WidgetDefinition::make($id, $class);
        $this->add($widget);
        return $widget;
    }
}
