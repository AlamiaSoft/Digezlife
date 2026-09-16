<?php

namespace Alamia\Core\Kernel\Experience\Builders;

use Alamia\Core\Kernel\Experience\DTOs\ResourceDefinition;
use Alamia\Core\Kernel\Experience\Registries\ResourceRegistry;

class ResourceBuilder
{
    protected ResourceRegistry $registry;
    protected string $scope;

    public function __construct(ResourceRegistry $registry, string $scope)
    {
        $this->registry = $registry;
        $this->scope = $scope;
    }

    public function add(ResourceDefinition $resource): static
    {
        $this->registry->registerInScope($this->scope, $resource);
        return $this;
    }

    public function create(string $id, string $class): ResourceDefinition
    {
        $resource = ResourceDefinition::make($id, $class);
        $this->add($resource);
        return $resource;
    }
}
