<?php

namespace Alamia\Core\Kernel\Experience\DTOs;

use Alamia\Core\Kernel\Experience\Conditions\HasConditions;

class LayoutDefinition
{
    use HasConditions;

    protected string $id;
    protected string $type;
    protected array $config = [];

    public function __construct(string $id, string $type)
    {
        $this->id = $id;
        $this->type = $type;
    }

    public static function make(string $id, string $type): static
    {
        return new static($id, $type);
    }

    public function config(array $config): static
    {
        $this->config = array_merge($this->config, $config);
        return $this;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getConfig(): array
    {
        return $this->config;
    }
}
