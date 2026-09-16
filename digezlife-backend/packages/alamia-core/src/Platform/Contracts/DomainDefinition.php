<?php

namespace Alamia\Core\Platform\Contracts;

interface DomainDefinition
{
    /**
     * Get the human-readable name of the domain.
     */
    public function name(): string;

    /**
     * Get a brief description of the domain's purpose.
     */
    public function description(): string;

    /**
     * Get the list of capabilities this domain provides.
     *
     * @return array<int, string>
     */
    public function capabilities(): array;

    /**
     * Get the version of this domain.
     */
    public function version(): string;
}
