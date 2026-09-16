<?php

namespace Alamia\Core\Kernel\Experience\Builders;

use Alamia\Core\Kernel\Experience\DTOs\SearchableItem;
use Alamia\Core\Kernel\Experience\Registries\SearchRegistry;

class SearchBuilder
{
    protected SearchRegistry $registry;
    protected string $scope;

    public function __construct(SearchRegistry $registry, string $scope)
    {
        $this->registry = $registry;
        $this->scope = $scope;
    }

    public function add(SearchableItem $item): static
    {
        $this->registry->registerInScope($this->scope, $item);
        return $this;
    }

    public function create(string $id, string $title, string $url, string $type): SearchableItem
    {
        $item = SearchableItem::make($id, $title, $url, $type);
        $this->add($item);
        return $item;
    }
}
