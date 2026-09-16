<?php

namespace Alamia\Core\Kernel\Experience\Builders;

use Alamia\Core\Kernel\Experience\DTOs\PageDefinition;
use Alamia\Core\Kernel\Experience\Registries\PageRegistry;

class PageBuilder
{
    protected PageRegistry $registry;
    protected string $scope;

    public function __construct(PageRegistry $registry, string $scope)
    {
        $this->registry = $registry;
        $this->scope = $scope;
    }

    public function add(PageDefinition $page): static
    {
        $this->registry->registerInScope($this->scope, $page);
        return $this;
    }

    public function create(string $id, string $class): PageDefinition
    {
        $page = PageDefinition::make($id, $class);
        $this->add($page);
        return $page;
    }
}
