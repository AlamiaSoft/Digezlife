<?php

namespace Alamia\Core\Kernel\Experience\DTOs;

use Alamia\Core\Kernel\Experience\Conditions\HasConditions;

class SettingSection
{
    use HasConditions;

    protected string $id;
    protected string $title;
    protected ?string $icon = null;
    protected array $fields = [];

    public function __construct(string $id, string $title)
    {
        $this->id = $id;
        $this->title = $title;
    }

    public static function make(string $id, string $title): static
    {
        return new static($id, $title);
    }

    public function icon(string $icon): static
    {
        $this->icon = $icon;
        return $this;
    }

    public function fields(array $fields): static
    {
        $this->fields = array_merge($this->fields, $fields);
        return $this;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getIcon(): ?string
    {
        return $this->icon;
    }

    public function getFields(): array
    {
        return $this->fields;
    }
}
