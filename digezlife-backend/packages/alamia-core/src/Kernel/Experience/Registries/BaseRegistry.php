<?php

namespace Alamia\Core\Kernel\Experience\Registries;

use Alamia\Core\Kernel\Experience\Contracts\ExperienceRegistryInterface;

abstract class BaseRegistry implements ExperienceRegistryInterface
{
    protected array $items = [];

    public function register($item): static
    {
        return $this->registerInScope('default', $item);
    }

    public function registerInScope(string $scope, $item): static
    {
        if (!isset($this->items[$scope])) {
            $this->items[$scope] = [];
        }

        $this->items[$scope][] = $item;

        return $this;
    }

    public function all(): array
    {
        return $this->items;
    }

    public function forScope(string $scope): array
    {
        return $this->items[$scope] ?? [];
    }
}
