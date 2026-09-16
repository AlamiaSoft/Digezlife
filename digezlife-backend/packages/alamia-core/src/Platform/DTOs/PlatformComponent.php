<?php

namespace Alamia\Core\Platform\DTOs;

class PlatformComponent
{
    /**
     * @param array<string, mixed> $metadata
     */
    public function __construct(
        public readonly string $id,
        public readonly string $name,
        public readonly string $type,
        public readonly string $description,
        public readonly string $version,
        public readonly bool $active,
        public readonly bool $toggleable,
        public readonly ?string $author,
        public readonly ?string $path,
        public readonly array $metadata = []
    ) {}
}
