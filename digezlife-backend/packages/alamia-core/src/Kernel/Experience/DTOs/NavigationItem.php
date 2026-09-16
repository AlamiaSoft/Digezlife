<?php

namespace Alamia\Core\Kernel\Experience\DTOs;

use Alamia\Core\Kernel\Experience\Conditions\HasConditions;
use Closure;

class NavigationItem
{
    use HasConditions;

    protected string $id;
    protected string $label;
    protected ?string $url = null;
    protected ?string $route = null;
    protected ?string $icon = null;
    protected ?string $group = null;
    protected ?string $badge = null;
    protected ?string $badgeColor = null;
    protected bool $tenantAware = true;

    public function __construct(string $id, string $label)
    {
        $this->id = $id;
        $this->label = $label;
    }

    public static function make(string $id, string $label): static
    {
        return new static($id, $label);
    }

    public function url(string $url): static
    {
        $this->url = $url;
        return $this;
    }

    public function route(string $route): static
    {
        $this->route = $route;
        return $this;
    }

    public function icon(string $icon): static
    {
        $this->icon = $icon;
        return $this;
    }

    public function group(string $group): static
    {
        $this->group = $group;
        return $this;
    }

    public function badge(string|Closure $badge, ?string $color = null): static
    {
        $this->badge = $badge;
        $this->badgeColor = $color;
        return $this;
    }

    public function tenantAware(bool $tenantAware = true): static
    {
        $this->tenantAware = $tenantAware;
        return $this;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function getUrl(): ?string
    {
        return $this->url;
    }

    public function getRoute(): ?string
    {
        return $this->route;
    }

    public function getIcon(): ?string
    {
        return $this->icon;
    }

    public function getGroup(): ?string
    {
        return $this->group;
    }

    public function getBadge(): ?string
    {
        return $this->badge;
    }

    public function getBadgeColor(): ?string
    {
        return $this->badgeColor;
    }

    public function isTenantAware(): bool
    {
        return $this->tenantAware;
    }
}
