<?php

namespace Alamia\Core\Kernel\Experience\DTOs;

use Alamia\Core\Kernel\Experience\Conditions\HasConditions;

class PageDefinition
{
    use HasConditions;

    protected string $id;
    protected string $class;
    protected ?string $route = null;
    protected ?string $slug = null;

    public function __construct(string $id, string $class)
    {
        $this->id = $id;
        $this->class = $class;
    }

    public static function make(string $id, string $class): static
    {
        return new static($id, $class);
    }

    public function route(string $route): static
    {
        $this->route = $route;
        return $this;
    }

    public function slug(string $slug): static
    {
        $this->slug = $slug;
        return $this;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getClass(): string
    {
        return $this->class;
    }

    public function getRoute(): ?string
    {
        return $this->route;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }
}
