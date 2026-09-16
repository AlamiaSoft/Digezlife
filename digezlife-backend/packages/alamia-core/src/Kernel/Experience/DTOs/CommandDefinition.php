<?php

namespace Alamia\Core\Kernel\Experience\DTOs;

use Alamia\Core\Kernel\Experience\Conditions\HasConditions;
use Closure;

class CommandDefinition
{
    use HasConditions;

    protected string $id;
    protected string $label;
    protected string|Closure $action;
    protected ?string $icon = null;
    protected ?string $shortcut = null;
    protected ?string $category = null;

    public function __construct(string $id, string $label, string|Closure $action)
    {
        $this->id = $id;
        $this->label = $label;
        $this->action = $action;
    }

    public static function make(string $id, string $label, string|Closure $action): static
    {
        return new static($id, $label, $action);
    }

    public function icon(string $icon): static
    {
        $this->icon = $icon;
        return $this;
    }

    public function shortcut(string $shortcut): static
    {
        $this->shortcut = $shortcut;
        return $this;
    }

    public function category(string $category): static
    {
        $this->category = $category;
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

    public function getAction(): string|Closure
    {
        return $this->action;
    }

    public function getIcon(): ?string
    {
        return $this->icon;
    }

    public function getShortcut(): ?string
    {
        return $this->shortcut;
    }

    public function getCategory(): ?string
    {
        return $this->category;
    }
}
