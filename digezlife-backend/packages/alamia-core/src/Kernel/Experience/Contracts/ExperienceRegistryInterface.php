<?php

namespace Alamia\Core\Kernel\Experience\Contracts;

interface ExperienceRegistryInterface
{
    public function register($item): static;

    public function all(): array;

    public function forScope(string $scope): array;
}
