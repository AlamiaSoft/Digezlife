<?php

namespace Alamia\Core\Kernel\Experience\Conditions;

use Closure;

trait HasConditions
{
    protected array $permissions = [];
    protected array $features = [];
    protected array $plans = [];
    protected array $licenses = [];
    protected bool|Closure $visible = true;
    protected int $priority = 0;

    public function permission(string|array $permissions): static
    {
        $this->permissions = array_merge($this->permissions, (array) $permissions);
        return $this;
    }

    public function feature(string|array $features): static
    {
        $this->features = array_merge($this->features, (array) $features);
        return $this;
    }

    public function plan(string|array $plans): static
    {
        $this->plans = array_merge($this->plans, (array) $plans);
        return $this;
    }

    public function license(string|array $licenses): static
    {
        $this->licenses = array_merge($this->licenses, (array) $licenses);
        return $this;
    }

    public function visible(bool|Closure $visible): static
    {
        $this->visible = $visible;
        return $this;
    }

    public function priority(int $priority): static
    {
        $this->priority = $priority;
        return $this;
    }

    public function getPermissions(): array
    {
        return $this->permissions;
    }

    public function getFeatures(): array
    {
        return $this->features;
    }

    public function getPlans(): array
    {
        return $this->plans;
    }

    public function getLicenses(): array
    {
        return $this->licenses;
    }

    public function getVisible(): bool|Closure
    {
        return $this->visible;
    }

    public function getPriority(): int
    {
        return $this->priority;
    }
}
