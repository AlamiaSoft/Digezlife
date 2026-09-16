<?php

namespace Alamia\Core\Kernel\Experience\DTOs;

use Alamia\Core\Kernel\Experience\Conditions\HasConditions;

class SearchableItem
{
    use HasConditions;

    protected string $id;
    protected string $title;
    protected ?string $subtitle = null;
    protected string $url;
    protected ?string $icon = null;
    protected string $type;

    public function __construct(string $id, string $title, string $url, string $type)
    {
        $this->id = $id;
        $this->title = $title;
        $this->url = $url;
        $this->type = $type;
    }

    public static function make(string $id, string $title, string $url, string $type): static
    {
        return new static($id, $title, $url, $type);
    }

    public function subtitle(string $subtitle): static
    {
        $this->subtitle = $subtitle;
        return $this;
    }

    public function icon(string $icon): static
    {
        $this->icon = $icon;
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

    public function getSubtitle(): ?string
    {
        return $this->subtitle;
    }

    public function getUrl(): string
    {
        return $this->url;
    }

    public function getIcon(): ?string
    {
        return $this->icon;
    }

    public function getType(): string
    {
        return $this->type;
    }
}
