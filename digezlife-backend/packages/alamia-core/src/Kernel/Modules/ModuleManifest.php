<?php

namespace Alamia\Core\Kernel\Modules;

class ModuleManifest
{
    public function __construct(
        public readonly string $id,
        public readonly string $name,
        public readonly string $version,
        public readonly array $providers = [],
        public readonly array $requires = [],
        public readonly array $dependencies = []
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            $data['id'] ?? '',
            $data['name'] ?? '',
            $data['version'] ?? '1.0.0',
            $data['providers'] ?? [],
            $data['requires'] ?? [],
            $data['dependencies'] ?? []
        );
    }
}
