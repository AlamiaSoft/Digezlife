<?php

namespace Alamia\Core\Kernel\Experience\DTOs;

use Alamia\Core\Kernel\Experience\Conditions\HasConditions;

class WidgetDefinition
{
    use HasConditions;

    protected string $id;
    protected string $class;

    public function __construct(string $id, string $class)
    {
        $this->id = $id;
        $this->class = $class;
    }

    public static function make(string $id, string $class): static
    {
        return new static($id, $class);
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getClass(): string
    {
        return $this->class;
    }
}
